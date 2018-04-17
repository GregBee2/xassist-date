/**
* @preserve
* https://github.com/GregBee2/xassist-date.git Version 1.2.2.
*  Copyright 2018 Gregory Beirens.
*  Created on Tue, 17 Apr 2018 10:42:12 GMT.
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@xassist/xassist-object')) :
	typeof define === 'function' && define.amd ? define(['exports', '@xassist/xassist-object'], factory) :
	(factory((global.xa = global.xa || {}),global.xa));
}(this, (function (exports,xassistObject) { 'use strict';

	//var { object } =require("@xassist/xassist-object");
	function getDecimal(num){
		return+((num<0?"-.":".")+num.toString().split(".")[1])||0
	}


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
				d[_durationRegexp[i].key]+=parseFloat((matchMade[1]||"0").replace(",","."));
			}
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
	var _conversionCoefficients={
		year:{
			coeff:7/(30.436875*12),
			exactType:"big"
		},
		month:{
			coeff:7/30.436875,
			exactType:"big"
		},
		week:{
			coeff:1,
			exactType:"small"
		},
		day:{
			coeff:7,
			exactType:"small"
		},
		hour:{
			coeff:168,
			exactType:"small"
		},
		minute:{
			coeff:10080,
			exactType:"small"
		},
		second:{
			coeff:604800,
			exactType:"small"
		},
		millisecond:{
			coeff:604800000,
			exactType:"small"
		}
	};
	XaDuration.prototype.normalize=function(exact){
		exact=(typeof exact==="undefined"?true:!!exact);
		//first we normalize up to upscale the factors thats needed like 12months becomes 1 year

		
		this.normalizeUp(exact);

		//the only factor that is decimal is the one from day to month so
		//after upscaling the only attribute potentially remaining decimal is day
		//now we can normalize down to eliminate decimals
		if(!this.normalized){
			this.normalizeDown(exact);
			//this could introduce other scaling factors that should be upscaled (added hours so hours fall above 24 or lower)
			//since those all fall lower then day we should only once scale up if necessary (but we put true to be sure to not change months
			this.normalizeUp(true);
		}

		
	};



	XaDuration.prototype.normalizeDown=function(exact){
		var key,dec,nextKey,factor;
		exact=(typeof exact==="undefined"?true:!!exact);
		for (var i=0,len=this._keyOrder.length;i<len;i++){
			key=this._keyOrder[i];
			nextKey=this._keyOrder[i+1];
			if(nextKey){
				factor=this.getConversionFactor(key,nextKey);
				if(!exact||factor.exact){
					dec=getDecimal(this[key]);
					this[key]=this[key]-dec;
					this[nextKey]+=dec*factor.factor;
				}
			}
		}
		//month is only one that can be decimal because only conversion thaht can be skipped with exact
		//we should not check millisecond because it is allowed to be decimal 
		this.normalized=((getDecimal(this.month))===0);
		return this;
	};
	XaDuration.prototype.normalizeUp=function(exact){
		var key,nextKey,factor,oldVal,i=this._keyOrder.length,normalized=true;
		exact=(typeof exact==="undefined"?true:!!exact);
		while(i--){
			key=this._keyOrder[i];
			nextKey=this._keyOrder[i-1];
			if(nextKey){
				factor=this.getConversionFactor(nextKey,key);
				if(!exact||factor.exact){
					oldVal=this[key];
					this[key]=oldVal%factor.factor;
					this[nextKey]+=(oldVal-this[key])/factor.factor;
				}
			}
			if(i!==this._keyOrder.length-1){
				normalized=normalized&&((this[key]*10%10/10)===0);
			}
		}
		this.normalized=normalized;
		return this;
	};
	XaDuration.prototype.getConversionFactor=function(fromUnit,toUnit){
		if(_conversionCoefficients.hasOwnProperty(fromUnit)&&_conversionCoefficients.hasOwnProperty(toUnit)){
			return {
				factor:(_conversionCoefficients[toUnit].coeff/_conversionCoefficients[fromUnit].coeff),
				exact:(_conversionCoefficients[toUnit].exactType===_conversionCoefficients[fromUnit].exactType)
			}
		}
		else{
			throw new TypeError("Invalid unit conversion type");
		}
	};
	XaDuration.prototype.valueOf=function(){
		//returns number of milliseconds
		var result=0,key;
		for (var i=0,len=this._keyOrder.length;i<len;i++){
			key=this._keyOrder[i];
			result+=(this.getConversionFactor(key,"millisecond").factor*this[key]);
		}
		return result
	};
	XaDuration.prototype.toString=function(){
		var result=[],key,v=this.valueOf(),dur=duration(Math.abs(v));
		dur.normalize(false);
		for (var i=0,len=this._keyOrder.length;i<len;i++){
			key=this._keyOrder[i];
			if(dur[key]!==0){
				result.push(dur[key]+" "+key+(dur[key]>1?"s":""));
			}
		}
		if(v<0){
			result.push("ago");
		}
		return result.join(' ')+".";
	};
	XaDuration.prototype.format=function(tolerance){
		//tolerance is the relative tolerance that may be accepted in the string representation
		//tolerance is a percentage eg 0.01=1% and should be given as a numeric value<1 
		//if tolerance is given as 1 just the largest component
		//decimals are never given 3.5 years is represented as 3 years 6 months 
		var result=[],key,
			v=this.valueOf(),
			absV=Math.abs(v),
			dur=duration(absV), //clone duration
			currentVal=0,
			relError=1;
		if(!tolerance){
			return this.toString();
		}
		tolerance=Math.abs(tolerance);
		tolerance=tolerance>1?1:tolerance;
		dur.normalize(false);

		for (var i=0,len=this._keyOrder.length;i<len&&relError>=tolerance;i++){
			key=this._keyOrder[i];
			if(dur[key]!==0){
				currentVal+=dur[key]*this.getConversionFactor(key,"millisecond").factor;
				result.push(dur[key]+" "+key+(dur[key]>1?"s":""));
				relError=1-currentVal/absV;

			}
			
		}
		//check if we could lower the relError by adding 1 to last found key (ex. rounding 3.5 years to 4)
		currentVal+=1*this.getConversionFactor(key,"millisecond").factor;
		if(relError>=(-1+currentVal/absV)){ //new relative error is negative because we are rounding up
			result.push(result.pop().split(" ").map(function(v,i){return (i==0?+v+1:v)}).join(" "));
		}	
		if(v<0){
			result.push("ago");
		}
		return result.join(' ')+".";
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
		var dec=getDecimal(this.month);
		this.month=this.month-dec;
		this.day+=numberOfDays*dec;
		return this.normalizeDown();
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
	XaDate.prototype.format=function(formatStr){
		/*
		//formatStr can be
		//d: day without leading zero
		//dd: day with leading zero
		//ddd: short day string
		//dddd: long day string
		//ddddd:single letter day string (may be more d's)
		//M:month without leading zero
		//MM or Mm:month with leading zero
		//mmm: short month string
		//mmmm: long month string
		//mmmmm: single letter month (may be more m's)
		//y or yy: 2digit year
		//yyy or yyyyyy: 4digit year
		//h: hour without leading zero
		//hh:hour with leading zero (or more h's)
		//m: minute without leading zero
		//mm: minute with leading zero
		//s: second without leading zero
		//ss: second with leading zero (or more s's)
		//.000 or ,000: any number of zero's is for the deci,centi,milliseconds, ...
		//all other characters are repeated as such in the string
		//the difference between m for minutes or month is made by the capitalization, at least one of the m's for (a one or two letter match) should be capitalized for months
		//all other strings could be capitalized or not.
		//to escape the characters use a ^  before the matching character eg ^mmm prints mmm
		*/
		
		/*var matchingChars=["d","D","m","M","y","Y","h","H","s","S",".",","];
		var result="";
		var matchingCombos={
			day:/(?:[^\\/dD]|^)([dD]+)/,
			month:/(?:[^\\/Mm]|^)(M[Mm]?|[Mm]{3,})/,
			year:/(?:[^\\/yY]|^)([yY]+)/,
			hour:/(?:[^\\/hH]|^)([hH]+)/,
			minute:/(?:[^\\/m]|^)(m{1,2})/,
			second:/(?:[^\\/sS]|^)([sS]+)/,
			millisecond:/(?:[^\\/,.]|^)([,.]0+)/
		}*/
		var matchResult={
			month:[
				function(d){return (d.getMonth()+1).toString();},
				function(d){return ("0"+(d.getMonth()+1)).slice(-2);},
				function(d){return d.month("short");},
				function(d){return d.month("long");},
				function(d){return d.month("abbreviation");}
			],
			day:[
				function(d){return (d.getDate()).toString();},
				function(d){return ("0"+d.getDate()).slice(-2);},
				function(d){return d.getWeekDay("short");},
				function(d){return d.getWeekDay("long");},
				function(d){return d.getWeekDay("abbreviation");}
			],
			year:[
				function(d){return d.getFullYear().toString().slice(-2)},
				function(d){return d.getFullYear().toString();},
			],
			/*minute:[
				function(d){return (d.getMinutes()).toString();},
				function(d){return ("0"+d.getMinutes()).slice(-2);}
			],
			hour:[
				function(d){return (d.getHours()).toString();},
				function(d){return ("0"+d.getHours()).slice(-2);}
			],
			second:[
				function(d){return (d.getSeconds()).toString();},
				function(d){return ("0"+d.getSeconds()).slice(-2);}
			],*/
			time:[
				function(d,fn){return (d[fn]()).toString();},
				function(d,fn){return ("0"+d[fn]()).slice(-2);}
			],
			millisecond:[
				function(d,len){return d.getMilliseconds().toString().slice(0,len);}
			]
		};
		var me=this;
		function getFormattedString(matchType){
			var firstChar=matchType[0];
			var matchLength=matchType.length;
			if (firstChar==="M"||(firstChar==="m"&&matchLength>2)){
				return matchResult.month[Math.min(matchLength,5)-1](me);
			}
			else if (firstChar==="d"||firstChar==="D"){
				return matchResult.day[Math.min(matchLength,5)-1](me);
			}
			else if (firstChar==="y"||firstChar==="Y"){
				return matchResult.year[(matchLength>2)+0](me);
			}
			else if (firstChar==="m"&&matchLength<3){
				return matchResult.time[matchLength-1](me,"getMinutes");
			}
			else if (firstChar==="s"||firstChar==="S"){
				return matchResult.time[Math.min(matchLength,2)-1](me,"getSeconds");
			}
			else if (firstChar==="h"||firstChar==="H"){
				return matchResult.time[Math.min(matchLength,2)-1](me,"getHours");
			}
			else if (firstChar==="."||firstChar===","){
				return matchResult.millisecond[0](me,matchLength-1);
			}
		}
		//var reDateString=/(?:[^\\/dD]|^)[dD]+|(?:[^\\/Mm]|^)M[Mm]?|[Mm]{3,}|(?:[^\\/yY]|^)[yY]+|(?:[^\\/hH]|^)[hH]+|(?:[^\\/m]|^)m{1,2}|(?:[^\\/sS]|^)[sS]+|(?:[^\\/,.]|^)[,.]0+/g;
		var reDateString=/[\s\S]([dD]+|M[Mm]?|[Mm]{3,}|[yY]+|[hH]+|m{1,2}|[sS]+|[,.]0+)/g;
		return ("1"+formatStr).replace(reDateString,function(m){
			var firstChar=m[0],match=m.slice(1);
			if(firstChar==="^"){
				return match;
			}
			else{
				return firstChar+getFormattedString(match);
			}
		}).slice(1)
	};
	XaDate.prototype.until=function(otherDate){
		if(!_validDate(otherDate)){
			//try to create other date object
			otherDate=new XaDate([].slice.call(arguments));
		}
		if(!otherDate.isValid()){
			throw new TypeError('until() needs a date or parseable dateargumenrs');
		}
		return duration(otherDate.valueOf()-this.valueOf());
		
		
	};
	XaDate.prototype.add=function(dur/*,firstBig*/){
		//console.log(dur);
		var args=[].slice.call(arguments);
		var firstBig=args.pop();
		if(typeof firstBig!=="boolean"){
			args.push(firstBig);
			firstBig=true; //this makes a difference in subtracting durations
		}
		//console.log(dur);
		if(dur.constructor.name!=="XaDuration"){
			dur=duration.apply(null,args);
		}
		
		dur.normalizeDown();
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
