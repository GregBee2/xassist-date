/**
* @preserve
* https://github.com/GregBee2/xassist-date.git Version 1.1.1.
*  Copyright 2018 Gregory Beirens.
*  Created on Fri, 30 Mar 2018 18:50:35 GMT.
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@xassist/xassist-object')) :
	typeof define === 'function' && define.amd ? define(['exports', '@xassist/xassist-object'], factory) :
	(factory((global.xa = global.xa || {}),global.xa));
}(this, (function (exports,xassistObject) { 'use strict';

	//var { object } =require("@xassist/xassist-object");

	var _durationRegexp=[
			{key:"year",re:			/(-?\d*(?:[.,]\d*)?)(?:[ ]?y|Y|years?|Years?)(?![a-zA-z])/g}, //years component
			{key:"month",re:			/(-?\d*(?:[.,]\d*)?)(?:[ ]?M|months?|Months?)(?![a-zA-z])/g}, //months component
			{key:"day",re:				/(-?\d*(?:[.,]\d*)?)(?:[ ]?d|D|days?|Days?)(?![a-zA-z])/g}, //days component
			{key:"hour",re:			/(-?\d*(?:[.,]\d*)?)(?:[ ]?h|H|hours?|Hours?)(?![a-zA-z])/g}, //hours component
			{key:"minute",re:			/(-?\d*(?:[.,]\d*)?)(?:[ ]?m|mins?|Mins?|minutes?|Minutes?)(?![a-zA-z])/g}, //minutes component 
			{key:"second",re:		/(-?\d*(?:[.,]\d*)?)(?:[ ]?s|S|secs?|Secs?|seconds?|Seconds?)(?![a-zA-z])/g}, //seconds component
			{key:"millisecond",re:	/(-?\d*(?:[.,]\d*)?)(?:[ ]?ms|millis?|m[sS]ecs?|m[sS]econds?|milli[sS]ecs?|milli[sS]econds?)(?![a-zA-z])/g}, //milliseconds component
		];
	/* regexp explanation for each component eg for year
		/								//start regexp
			(									//capturing group 1 number of years
				-?									//optional negative number
				\d*								//zero or more digits
				(?:								//non capturing group
					[.,]								//matches single character (point or ,)
					\d*								//zero or more digits
				)?									//optional could be omitted
			)									//capturing group finished (matches on 1.25|0.25|1000|1.|.|.5 or with a comma.)
			(?:								//non capturing group (years)
				[ ]?								//optional space
				y|Y|years?|Years?			//y or Y or year or years or Year or Years
			)									//closes group for (y||Y||year||years||Year||Years)
			(?![a-zA-z])					//negative lookahead everything except a-z or A-Z
		/g							//global match
	*/
	function _parseDurationString(d,durStr){
		var matchMade;
		//parse string
		//eg 1y1M1d1h1m1s1ms
		//abbrev
		for(var i=0,len=_durationRegexp.length;i<len;i++){
			
			//for multiple matches on same regegexp we could use exec
			while (matchMade = _durationRegexp[i].re.exec(durStr)) {
				//console.log(matchMade)
				d[_durationRegexp[i].key]+=parseFloat((matchMade[1]||"0").replace(",","."));
			}
			
			/*
			//single match
			matchMade=durStr.match(_durationRegexp[i].re)
			if(matchMade&&matchMade[1]){
				d[_durationRegexp[i].key]+=parseFloat(("0"+matchMade[1]).replace(",","."));
			}	*/
		}
		return d;
	}
	var duration=function(){
		
		return new XaDuration([].slice.call(arguments));
	};
	function XaDuration(initArray){
		
		this.year=0;
		this.month=0;
		this.day=0;
		this.hour=0;
		this.minute=0;
		this.second=0;
		this.millisecond=0;
		this.normalized=false;
		//this.dayReserve=0; //hold converted month decimals in days, to calculate when really needed
		this.init(initArray);
		
	}
	XaDuration.prototype._keyOrder=[ 'year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond' ];
	XaDuration.prototype.init=function(a){
		
		if (a.length===1){
			if(typeof a[0]==="string"){
				_parseDurationString(this,a[0]);
			}
			else if(typeof a[0]==="number"){
				//milliseconds is default value
				this.millisecond+=a[0];
			}
			else if(typeof a[0]==="object"){
				//milliseconds is default value
				xassistObject.object(this).mergeUnique(a[0]);
			}
		}
		if(a.length>1){
			a.forEach(function(val,i){
				//console.log(val,i,wantedKeys[i],this[wantedKeys[i]])
				if(i<this._keyOrder.length&&typeof val==="number"){ 
					this[this._keyOrder[i]]+=val;
				}
			},this);
		}
		
	};
	/*
	we should normalize the floating values to do calculations with dates
	this works for 
	- s=>milisecs (*1000)
	- min=>sec (*60)
	- hr=>min (*60)
	- day=>hr (*24)
	- year=>month (*12)
	exception
	-month=>day (*30 or *31 or *28 or even *29)
	So there is a break in normalization between day and month setting apart month and year!
	*/
	var _conversionTable={
		year:{
			conv:function(x){return x*12},
			to:"month"
		},
		/*month:{
			conv:function(x){
				return x;
			},
			to:"dayReserve"
		},*/
		day:{
			conv:function(x){return x*24},
			to:"hour"
		},
		hour:{
			conv:function(x){return x*60},
			to:"minute"
		},
		minute:{
			conv:function(x){return x*60},
			to:"second"
		},
		second:{
			conv:function(x){return x*1000},
			to:"millisecond"
		},
	};

	XaDuration.prototype.normalize=function(){
		var key,dec;
		for (var i=0,len=this._keyOrder.length;i<len;i++){
			key=this._keyOrder[i];
			if(!_conversionTable.hasOwnProperty(key)){
				continue;
			}
			
			dec=this[key]*10%10/10;
			
			this[key]=this[key]-dec;
			this[_conversionTable[key].to]+=_conversionTable[key].conv(dec);
			
		}
		this.normalized=((this.month*10%10/10)===0);
		return this;
	};
	XaDuration.prototype.addDuration=function(dur){
		var key,i,len;
		for (i=0, len=this._keyOrder.length;i<len;i++){
			key=this._keyOrder[i];
			if(dur.hasOwnProperty(key)&&typeof dur[key]==="number"){
				this[key]+=dur[key];
			}
		}
		return this;
	};
	XaDuration.prototype.removeIntervalOfType=function(type,value){
		
		if(~this._keyOrder.indexOf(type) ){
			value=(typeof value==="number"?value:this[type]);
			this[type]-=value;
			return value;
		}
		else{
			return 0;
			//throw typeError("Invalid interval type");
		}
	};
	XaDuration.prototype.normalizeMonth=function(numberOfDays){
		var dec=this.month*10%10/10;
	//console.log(this.month+"-"+dec)	
		this.month=this.month-dec;
		this.day+=numberOfDays*dec;
		return this.normalize();
	};

	var _dateDict = {
			days:{
				defaultKey:"long",
				"abbreviation" : ["S", "M", "T", "W", "T", "F", "S"],
				"short":["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
				"long":["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
			},
			month:{
				defaultKey:"long",
				"abbreviation" : ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
				"short": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
				"long": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
			}
		},
		_leapYear=function(year)
		{
			//year not divisible by 4 => no leapyear (year % 4 == year & 3 (bitwise AND x%2^n===x&2^(n-1) bit wise and)
			//else: year not divisible by 100 => leapyear (year % 4 => check year%25
			//else year divisble by 400 => leapyear ( (year %400) knwoing that year%25==0=>year%16 or year & 15)
			year=((typeof year==="undefined")?new Date().getFullYear():year);
			if(year>0||year<0){
				return ((year & 3) == 0 && ((year % 25) != 0 || (year & 15) == 0));
			}
			return undefined;
		},
		_maxNumberofDays=function(month,year){
			var leap;
			month=((typeof month==="undefined")?new Date().getMonth()+1:month);
			if(month===2){
				leap=_leapYear(year);
				return (typeof leap==="undefined"?leap:(leap?29:28))
			}
			else {
				return [31,28,31,30,31,30,31,31,30,31,30,31][month-1]
			}
		},
		_validDate = function (d) {
			if (Object.prototype.toString.call(d) === "[object Date]") {
				// it is a date
				if (isNaN(d.getTime())) { // d.valueOf() could also work
					// date is not valid
					return false;
				} else {
					// date is valid
					return true;
				}
			} else {
				// not a date
				return false;
			}
		},
		_dateRegExp=/^(\d{4}|\d{2}|[1-2]?\d{1}|3[0-1])[-/\\.](0?[1-9]|[1-2]\d{1}|3[0-1])[-/\\.](\d{4}|\d{2}|[1-2]?\d{1}|3[0-1])(?:[T ]([0-1]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:[.,](\d*)?)?)?)?$/i;
		/*regexp for datetime matching
			^ 							//strings starts with
			( 							//capturing group 1 (year or day)
				\d{4}					//YYYY
				|						//or
				\d{2}					// YY or DD (01-31), difference not captured
				|						//or
				[1-2]?\d{1}				// D (1-29) ! 0 is allowed
				|						//or
				3[0-1]					// D (30-31)
			)
			[							//date-split:match single character from list
				-						//dash
				/						//forward slash 
				\\						//back slash escaped
				.						//point 
			]							//end list
			(							//capturing group 2 (month)
				0?[1-9]					//optional 0 and 1-9 (1-9 or 01-09)
				|
				[1-2]?\d{1}				// D (1-29) ! 0 is allowed
				|						//or
				3[0-1]					// D (30-31)
			)
			[							//date-split:match single character from list
				-						//dash
				/						//forward slash 
				\\						//back slash escaped
				.						//point 
			]							//end list
			( 							//capturing group 3 (year or day)
				\d{4}					//YYYY
				|						//or
				\d{2}					// YY or DD (01-31), difference not captured
				|						//or
				[1-2]?\d{1}				// D (1-29) ! 0 is allowed
				|						//or
				3[0-1]					// D (30-31)
			)
			(?:							//non capturing group (time)
				[T ]					//1 character from list (T or space)
				(						//captruing group 4: hour
					[0-1]\d|2[0-3]		//00-19 or 20-23
				)
				:						//matches colon ":"
				(						//capturing group 5: minutes
					[0-5]\d				//00-59
				)				
				(?:						//non capturing group (seconds and milliseconds)
					:					//matches colon ":"
					(					//capturing group 6: seconds
						[0-5]\d			//00-59
					)			
					(?:					//non capturing group (milliseconds)
						[.,]			//matches single character (point or ,)
						(				//capturing group 7
							\d*			//any number of digits
						)?				//optional could be omitted
					)?					//optional could be omitted
				
				)?						//optional could be omitted
			
			
			
			)?							//optional, could be omitted
			$							//string end here
		*/
		//date functionality
		//date functionality
	var _getWeekDay= function (/*index,*/type, startindexOfWeek, zeroBased) {
		var onDateObj=0,index;

		if (this && this.constructor && this.constructor.name==="XaDate") {
			onDateObj=1;
		}
		index = (onDateObj?this.getDay():arguments[0]||0);
		type = (""+arguments[1-onDateObj]||_dateDict.days.defaultKey).toLowerCase();
		startindexOfWeek = (onDateObj?0:arguments[2]||0);
		zeroBased = (onDateObj?true:!!(typeof arguments[3]!=="undefined"? arguments[3]:true));
		
		index =((index - (zeroBased ? 0 : 1) + startindexOfWeek) % 7);
		type=(!_dateDict.days.hasOwnProperty(type)?_dateDict.days.defaultKey:type);
		index=(index<0?7+index:index);
		return _dateDict.days[type][index];
	};
	var _getMonth=function (/*index,*/type, zeroBased) {
		var onDateObj=0,index;
		if (this &&this.constructor &&  this.constructor.name==="XaDate") {
			onDateObj=1;
		}
		index = (onDateObj?this.getMonth():arguments[0]||0);
		type = (""+arguments[1-onDateObj]||_dateDict.month.defaultKey).toLowerCase();
		type=(!_dateDict.month.hasOwnProperty(type)?_dateDict.month.defaultKey:type);
		zeroBased = (onDateObj?true:!!(typeof arguments[2]!=="undefined"? arguments[2]:true));
		index = ((index - (zeroBased ? 0 : 1)) % 12);
		index=index<0?12+index:index;
		return _dateDict.month[type][index];
	};
	var _testDateFormat=function(day,month,year){
		return day<=_maxNumberofDays(month,year);
	};

	var date=function() {
		return new XaDate([].slice.call(arguments));
		
	};

	date.isValidDateString=function (str) {
			var dateObj={
					valid:false,
					format:[]
				},
				matchRes=str.match(_dateRegExp),
				p1,p3,p2,p1Year,p3Year,possibleFormats=[];
			if(matchRes){
				p1=parseInt(matchRes[1]);
				//dateObj.month=parseInt(matchRes[2]);
				p2=parseInt(matchRes[2]);
				p3=parseInt(matchRes[3]);
				//we assume hours and minutes is (mostly) defined
				//seconds and milliseconds is not (always) defined
				dateObj.hours=parseInt(matchRes[4]||0); //fastest comparison if matchRes[4] is defined
				dateObj.minutes=parseInt(matchRes[5]||0); //fastest comparison if matchRes[5] is defined
				dateObj.seconds=(matchRes[6]?parseInt(matchRes[6]):0);//faster comparison for undefined in stead of "or"
				dateObj.milliSeconds=(matchRes[7]?parseInt(matchRes[7]):0); //faster comparison for undefined in stead of "or"
				dateObj.valid=true;
				dateObj.multipleFormats=false;
				var numberToYear=function(y){
					return (y<100?(y>50?1900+y:2000+y):y)
				};
				p1Year=numberToYear(p1);
				p3Year=numberToYear(p3);
				possibleFormats=[
					{	day:p1,month:p2,year:p3Year,format:"DMY"},
					{	day:p3,month:p2,year:p1Year,format:"YMD"},
					{	day:p2,month:p1,year:p3Year,format:"MDY"},
					{	day:p2,month:p3,year:p1Year,format:"YDM"}
				].filter(function(x){return (x.day<32&&x.month<13&&_testDateFormat(x.day,x.month,x.year));});
				if(!possibleFormats.length){
					return false;
				}
				else {
					dateObj.day=[];
					dateObj.month=[];
					dateObj.year=[];
					dateObj.multipleFormats=true;
					dateObj.format=[];
					possibleFormats.forEach(function(x){
						dateObj.day.push(x.day);
						dateObj.month.push(x.month);
						dateObj.year.push(x.year);
						dateObj.format.push(x.format);
					});
					return dateObj;
				}
				
			}
			else{
				return false;
			}
			
		};
	date.stringToDate = function (str,format) {
			var dateObj=date.isValidDateString(str);
			if(dateObj){

					//rewrite format to index of assigned format
					if(typeof format!=="string"){
						format=0;
						
					}
					else {
						format=dateObj.format.indexOf(format.toUpperCase());
						if(format===-1){
							return false;
						}
					}	


				return date(dateObj.year[format],dateObj.month[format]-1,dateObj.day[format],dateObj.hours,dateObj.minutes,dateObj.seconds,dateObj.milliSeconds);
			}
			else{
				return false;
			}
		};
	function XaDate(inputArray) {
		var x = new(Function.prototype.bind.apply(
					Date, [Date].concat(inputArray)));
		Object.setPrototypeOf(x, XaDate.prototype);
		return x;
	}
	//Object.setPrototypeOf(XaDate, XaDate.prototype);
	Object.setPrototypeOf(XaDate.prototype, Date.prototype);
	XaDate.prototype.isValid = function () {
		return  _validDate(this);
	};
	/*if date is not set:4arguments: index of weekday,type,startindexOfWeek and zeroBased
	else index=date.getDay();*/
	/*TODO adapt arguments optional, ...*/
	date.getWeekDay=_getWeekDay.bind(null);
	date.month =_getMonth.bind(null);
	XaDate.prototype.getWeekDay =_getWeekDay;
	XaDate.prototype.month =_getMonth;
	XaDate.prototype.isLeapYear =function(){
		return (this.isValid()?_leapYear(this.getFullYear()):undefined);
	};
	date.isLeapYear = _leapYear;
	XaDate.prototype.daysInMonth =function(){
		return  (this.isValid()?_maxNumberofDays(this.getMonth()+1,this.getFullYear()):undefined);
	};
	date.daysInMonth = _maxNumberofDays;
	XaDate.prototype._addSmall=function(dur){
		this.addDays(dur.removeIntervalOfType("day"));
		this.addHours(dur.removeIntervalOfType("hour"));
		this.addMinutes(dur.removeIntervalOfType("minute"));
		this.addSeconds(dur.removeIntervalOfType("second"));
		this.addMilliseconds(dur.removeIntervalOfType("millisecond"));
		return this;
	};
	XaDate.prototype._addBig=function(dur){
		//console.log("before: "+this.toLocaleString())
		var currentDay=this.getDate(),currentMonth;
		var decMonth=dur.month*10%10/10;
		var groundMonth=dur.month-decMonth;
		this.addYears(dur.removeIntervalOfType("year"));
		this.addMonths(dur.removeIntervalOfType("month",groundMonth));
		//remove rounding errors
		dur.month=decMonth;
		//we get month and set date date
		currentMonth=this.getMonth();
		this.setDate(currentDay);
		if (this.getMonth() !== currentMonth){
			this.setDate(0); //go back to last day of previous month;
		}
		//console.log("after: "+this.toLocaleString()+")
		
	};
	XaDate.prototype.add=function(dur/*,firstBig*/){
		var args=[].slice.call(arguments);
		var firstBig=args.pop();
		if(typeof firstBig!=="boolean"){
			args.push(firstBig);
			firstBig=true; //this makes a difference in subtracting durations
		}
		if(dur.constructor.name!=="XaDuration"){
			dur=duration.apply(null,args);
		}
		dur.normalize();
		if (firstBig){
			this._addBig(dur);
			dur.normalizeMonth(this.daysInMonth());
		}
		//console.log(dur)
		this._addSmall(dur);
		if(!firstBig){
			dur.normalizeMonth(this.daysInMonth());
			this._addSmall(dur); 
			this._addBig(dur);
			
		}
		return this;
	};
	XaDate.prototype.addMonths=function(m){
		//faster implementation than datejs
		var day,month;
		if(typeof m!=="number"){
			return this;
		}
		day=this.getDate();
		this.setMonth(this.getMonth() + m, 1);
		month=this.getMonth();
		this.setDate(day);
		if (this.getMonth() !== month){
			this.setDate(0); //go back to last day of previous month;
		}
	    return this;
	};
	XaDate.prototype.addYears=function(y){
		//faster implementation than datejs
		var month;
		if(typeof y!=="number"){
			return this;
		}
		month=this.getMonth();
		//day=this.getDate()
		this.setFullYear(this.getFullYear() + y,month);

		if (this.getMonth() !== month){
			this.setDate(0); //go back to last day of previous month;
		}
	    return this;
	};
	XaDate.prototype.addDays=function(d){

		if(typeof d!=="number"){
			return this;
		}
		this.setDate(this.getDate()+d); 
	    return this;
	};
	XaDate.prototype.addHours=function(h){

		if(typeof h!=="number"){
			return this;
		}
		this.setHours(this.getHours()+h); 
	    return this;
	};
	XaDate.prototype.addMinutes=function(m){

		if(typeof m!=="number"){
			return this;
		}
		this.setMinutes(this.getMinutes()+m); 
	    return this;
	};
	XaDate.prototype.addSeconds=function(s){

		if(typeof s!=="number"){
			return this;
		}
		this.setSeconds(this.getSeconds()+s); 
	    return this;
	};
	XaDate.prototype.addMilliseconds=function(m){

		if(typeof m!=="number"){
			return this;
		}
		this.setMilliseconds(this.getMilliseconds()+m); 
	    return this;
	};

	exports.date = date;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
