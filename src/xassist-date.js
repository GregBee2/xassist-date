"use strict"

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
		return (typeof year==="number"?((year & 3) == 0 && ((year % 25) != 0 || (year & 15) == 0)):undefined);
	},
	_maxNumberofDays=function(month,year){
		if(month===2){
			return (_leapYear(year)?29:28)
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
	var onValidDate=0,index;
	//console.log(l);
	if (this.valid) {
		onValidDate=1;
	}
	index = (onValidDate?this.getDay():arguments[0]||0);
	type = (arguments[1-onValidDate]||_dateDict.days.defaultKey).toLowerCase();
	startindexOfWeek = arguments[2-onValidDate]||0;
	zeroBased = !!(arguments[3-onValidDate]||true);
	index = Math.abs((index - (zeroBased ? 0 : 1) + startindexOfWeek) % 7);
	type=!_dateDict.days.hasOwnProperty(type)?_dateDict.days.defaultKey:type;
	return _dateDict.days[type][index];
};
var _testDateFormat=function(day,month,year){
	return day<=_maxNumberofDays(month,year);
}

var date=function() {
	return new DateObj([].slice.call(arguments));
	
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
function DateObj(inputArray) {
	var x = new(Function.prototype.bind.apply(
				Date, [Date].concat(inputArray)));
	Object.setPrototypeOf(x, DateObj.prototype);
	x.valid = _validDate(x);
	return x;
}
//Object.setPrototypeOf(DateObj, DateObj.prototype);
Object.setPrototypeOf(DateObj.prototype, Date.prototype);
DateObj.prototype.isValid = function () {
	return this.valid;
};
/*if date is not set:4arguments: index of weekday,type,startindexOfWeek and zeroBased
else index=date.getDay();*/
/*TODO adapt arguments optional, ...*/
date.getWeekDay=_getWeekDay.bind({valid:false});
DateObj.prototype.getWeekDay =_getWeekDay
DateObj.prototype.month = function (type, zeroBased) {
	var l = arguments.length,
	index;
	if (this.valid) {
		index = this.getMonth();
		l = l + 1; /*index not set so we shift 1*/
	} else {
		index = arguments[0];
		type = arguments[1];
		zeroBased = arguments[2];
	}
	if (l === 1) {
		type = _dateDict.month.defaultKey;
		zeroBased = true;
	} else if (l === 2) {
		zeroBased = true;
	}
	zeroBased = !!zeroBased;
	type = type.toLowerCase();
	index = Math.abs((index - (zeroBased ? 0 : 1)) % 12);
	if(!_dateDict.month.hasOwnProperty(type)){
		type = _dateDict.month.defaultKey;
	}
	return _dateDict.month[type][index];
};
export default date;
