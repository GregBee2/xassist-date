"use strict"
import { default as duration } from "./xassist-duration.js"
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
}

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
			p2=parseInt(matchRes[2])
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
			}
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
XaDate.prototype.getWeekDay =_getWeekDay
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
}
XaDate.prototype.add=function(dur/*,firstBig*/){
	var decMonth,groundMonth,currentDay,currentMonth,args=[].slice.call(arguments);
	var firstBig=args.pop();
	if(typeof firstBig!=="boolean"){
		args.push(firstBig)
		firstBig=true; //this makes a difference in subtracting durations
	}
	if(dur.constructor.name!=="XaDuration"){
		dur=duration.apply(null,args)
	}
	dur.normalize();
	if (firstBig){
		currentDay=this.getDate();
		this.addYears(dur.removeIntervalOfType("year"));
		decMonth=dur.month*10%10/10;
		groundMonth=dur.month-decMonth;
		//console.log(dur)
		this.addMonths(dur.removeIntervalOfType("month",groundMonth));
		//remove rounding errors
		dur.month=decMonth
		console.log(dur.month)
		//we get month and set date date
		currentMonth=this.getMonth();
		this.setDate(currentDay);
		 if (this.getMonth() !== currentMonth){
			this.setDate(0) //go back to last day of previous month;
		}
		//console.log(dur)
		
		dur.normalizeMonth(this.daysInMonth());
	}
	//console.log(dur)
	this._addSmall(dur);
	if(!firstBig){
		console.log(dur)
		console.log(this.daysInMonth())
		dur.normalizeMonth(this.daysInMonth());
		console.log(dur)
		//console.log(dur)
		//decMonth=dur.month*10%10/10;
		//groundMonth=dur.month-decMonth;
		this._addSmall(dur); //what if this is not an integer? we should normalise further
		currentDay=this.getDate();
		this.addYears(dur.removeIntervalOfType("year"));
		this.addMonths(dur.removeIntervalOfType("month"));
		//we get month and set date date
		currentMonth=this.getMonth();
		this.setDate(currentDay);
		 if (this.getMonth() !== currentMonth){
			this.setDate(0) //go back to last day of previous month;
		}
		//console.log(dur)
	}
	return this;
}
XaDate.prototype.addMonths=function(m){
	//faster implementation than datejs
	var day,month;
	if(typeof m!=="number"){
		return this;
	}
	day=this.getDate()
	this.setMonth(this.getMonth() + m, 1);
	month=this.getMonth();
	this.setDate(day);
	 if (this.getMonth() !== month){
		this.setDate(0) //go back to last day of previous month;
	}
    return this;
}
XaDate.prototype.addYears=function(y){
	//faster implementation than datejs
	var day,month;
	if(typeof y!=="number"){
		return this;
	}
	month=this.getMonth();
	//day=this.getDate()
	this.setFullYear(this.getFullYear() + y,month);

	 if (this.getMonth() !== month){
		this.setDate(0) //go back to last day of previous month;
	}
    return this;
}
XaDate.prototype.addDays=function(d){

	if(typeof d!=="number"){
		return this;
	}
	this.setDate(this.getDate()+d) 
    return this;
}
XaDate.prototype.addHours=function(h){

	if(typeof h!=="number"){
		return this;
	}
	this.setHours(this.getHours()+h) 
    return this;
}
XaDate.prototype.addMinutes=function(m){

	if(typeof m!=="number"){
		return this;
	}
	this.setMinutes(this.getMinutes()+m) 
    return this;
}
XaDate.prototype.addSeconds=function(s){

	if(typeof s!=="number"){
		return this;
	}
	this.setSeconds(this.getSeconds()+s) 
    return this;
}
XaDate.prototype.addMilliseconds=function(m){

	if(typeof m!=="number"){
		return this;
	}
	this.setMilliseconds(this.getMilliseconds()+m) 
    return this;
}
export default date;
