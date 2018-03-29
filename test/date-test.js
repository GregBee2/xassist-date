var definition = require("../package.json");
var { date } =require("../"+definition.main);
var tape=require("tape");

var possibleDateDelimiters=["-","/","\\","."]
var possibleDateTimeDelimiter=[" ","T"]
var possibleTimeMilliSecondDelimiter=[".",","]


var validDateStrings=[
	["2017","12","1"], //YMD 1 dec 2017 || YDM 12 jan 2017
	["32","12","1"], //YMD 1 dec 2032  || YDM 12 jan 2032
	["51","12","1"], //YMD  1 dec 1951 || YDM 12 jan 1951
	["1","12","2017"], //DMY 1 dec 2017 || MDY 12 jan 2017
	["1","12","32"], //DMY 1 dec 2032     || MDY 12 jan 2032
	["1","12","51"], //DMY  1 dec 1951    || MDY 12 jan 1951
	["1","2","3"], //DMY 1 feb 2003 YMD 3 feb 2001 MDY 2 jan 2003 YDM 2 mar 2001
	["2017","13","1"], //YDM 13 jan 2017,
	["31","11","1"], //DMY  31 nov 2001 or YMD 1 nov 2031 only second is valid or YDM 11 jan 2031
	["29","2","2016"], //DMY 29 feb 2016
	["29","2","2000"], //DMY 29 feb 2016
];
var expectedResult=[
	new Date(2017,11,1).valueOf(),
	new Date(2032,11,1).valueOf(),
	new Date(1951,11,1).valueOf(),
	new Date(2017,11,1).valueOf(),
	new Date(2032,11,1).valueOf(),
	new Date(1951,11,1).valueOf(),
	new Date(2003,1,1).valueOf(),
	new Date(2017,0,13).valueOf(),
	new Date(2031,10,1).valueOf(),
	new Date(2016,1,29).valueOf(),
	new Date(2000,1,29).valueOf()
]
var simpleDateArray=[2017,13,1]
var possibleFormats=[
	["YMD","YDM"],
	["YMD","YDM"],
	["YMD","YDM"],
	["DMY","MDY"],
	["DMY","MDY"],
	["DMY","MDY"],
	["YMD","YDM","DMY","MDY"],
	["YDM"],
	["YMD","YDM"],
	["DMY"],
	["DMY"]
]
var invalidDateStrings=[
	["31","11","2017"], //DMY 1 dec 2017
	["29","2","2015"], //DMY 29 feb 2015
	["29","2","1900"], //DMY 29 feb 1900 no leapyear
];

function checkDates(dates,fn,mapFn){
	d=[]
	possibleDateDelimiters.forEach(function(delim){
		d=d.concat(dates.map(x=>x.join(delim)));
	})
	d=d.map(x=>fn(x));
	if(typeof mapFn==="undefined"){

		return d
	}
	else{
		return d.map(mapFn);
	}
}

function checkFormats(dateStr,formatsExpected,x,i){
	var result=true;
	if(formatsExpected[i%dateStr.length].length!==x.format.length){
		return false
	}
	else{
		x.format.forEach(f=>result=result&&(!!~formatsExpected[i%dateStr.length].indexOf(f)))
		return result;
	}
}
function checkDateValue(dateStr,valuesExpected,x,i){
	return valuesExpected[i%dateStr.length]===x.valueOf();
}


tape("date.stringToDate(): converts date to DateObj", function(test){
	var invalids=checkDates(invalidDateStrings,date.stringToDate);
	var valids=checkDates(validDateStrings,date.stringToDate,checkDateValue.bind(null,validDateStrings,expectedResult));
	//console.log(checkDates(validDateStrings,date.stringToDate,function(x,i){return [x.valueOf(),expectedResult[i%validDateStrings.length]]}))
	test.ok(invalids.every(x=>x===false),
		"date.stringToDate() handles invalid dates correctly");
	
	test.ok(valids.every(x=>x===true),
		"date.stringToDate() handles valid dates correctly");
	test.end();
});
tape("date.isValidDateString(): checks if a datestring is valid and returns the possible formats", function(test){
	var invalids=checkDates(invalidDateStrings,date.isValidDateString);
	var valids=checkDates(validDateStrings,date.isValidDateString,checkFormats.bind(null,validDateStrings,possibleFormats));
	
	test.ok(invalids.every(x=>x===false),
		"date.isValidDateString() handles invalid dates correctly");
	test.ok(valids.every(x=>x===true),
		"date.isValidDateString() handles valid dates correctly");
	test.ok(date.isValidDateString(simpleDateArray.join(' '))===false,
		"date.isValidDateString() handles invalid delimiters between dates ok");
	test.end();
});
tape("date(): date creates new class instance of DateObj", function(test){
	//constrcutor is DateObj
	test.ok(date(2017,10,31).constructor.name==="DateObj" && date(2017,10,31) instanceof Date,
		"date() sets constructor to DateObj, but remains instanceof Date");
	test.end();
});


tape("date().isValid(): returns if the created date is a valid date", function(test){
	test.ok(date("foo").isValid()===false && date().isValid(),
		"date().isValid() WORKS");
	test.end();
});
tape("date().getWeekday(): returns the weekday of valid date or undefined", function(test){
	var a=date(2018,2,29);
	var b=date("");
	//getWeekday(type [default:long])
	test.ok(a.getWeekDay()==="Thursday",
		"date().getWeekday() returns day of date() when valid");
	test.ok(typeof b.getWeekDay()==="undefined",
		"date().getWeekday() returns undefined if date() is invalid");
	test.ok(a.getWeekDay("Short")==="Thu" && a.getWeekDay("abbreviation")=="T" && a.getWeekDay("LONG")=="Thursday" && a.getWeekDay("UNkncdfj")=="Thursday",
		"date().getWeekday(type) returns short,abbreviated or long daynames, with default to long");
	test.ok(a.getWeekDay("long",1)==="Thursday" &&typeof b.getWeekDay("long",1)==="undefined",
		"date().getWeekday(type,startWeekIndex) startWeekIndex does nothing on valid date, invalid dates return undefined");
	test.ok(a.getWeekDay("long",1,false)==="Thursday" &&typeof  b.getWeekDay("long",1,false)==="undefined",
		"date().getWeekday(type,startWeekIndex,zeroBased) zeroBased does nothing on valid date, invalid dates return undefined");
	test.end();
});
tape("date.getWeekday(): gives the weekday based on index", function(test){
	//getWeekday(index,type [default:long],startIndexofWeek [default:0],zeroBased [default:true])
	test.ok(date.getWeekDay()==="Sunday",
		"date.getWeekday() returns first day of week");
	test.ok(date.getWeekDay(1)==="Monday"&&date.getWeekDay(8)==="Monday"&&date.getWeekDay(-8)=="Saturday",
		"date.getWeekday(index) returns day of week corresponding to index, it even works with indexes>6 or negative indices");
	test.ok(date.getWeekDay(1,"Short")==="Mon" && date.getWeekDay(1,"abbreviation")=="M" && date.getWeekDay(1,"LONG")=="Monday" && date.getWeekDay(1,"UNkncdfj")=="Monday",
		"date.getWeekday(index,type) returns short,abbreviated or long daynames, with default to long");
	test.ok(date.getWeekDay(1,"long",1)==="Tuesday" ,
		"date.getWeekday(index,type,startWeekIndex) startWeekIndex sets first day of week (0=sunday,1=monday,...), defaults to 0");
	test.ok(date.getWeekDay(1,"long",1,false)==="Monday" && date.getWeekDay(-7,"long",1,false)==="Sunday"&& date.getWeekDay(0,"long",1,false)==="Sunday" && date.getWeekDay(1,"long",1,true)==="Tuesday",
		"date.getWeekday(index,type,startWeekIndex,zeroBased) zeroBased sets base of index (not of startWeekindex), defaults to true");
	test.end();
});
tape("date().month(): returns the month of valid date or undefined", function(test){
	var a=date(2018,2,29);
	var b=date("");
	//month(type [default:long])
	test.ok(a.month()==="March",
		"date().month() returns month of date() when valid");
	test.ok(typeof b.month()==="undefined",
		"date().month() returns undefined if date() is invalid");
	test.ok(a.month("Short")==="Mar" && a.month("abbreviation")=="M" && a.month("LONG")=="March" && a.month("UNkncdfj")=="March",
		"date().month(type) returns short,abbreviated or long monthnames, with default to long");
	test.ok(a.month("long",false)==="March" &&typeof  b.month("long",false)==="undefined",
		"date().month(type,zeroBased) zeroBased does nothing on valid date, invalid dates keep returning undefined");
	test.end();
});
tape("date.month(): gives the month based on index", function(test){
	test.ok(date.month()==="January",
		"date.month() returns first month of year");
	test.ok(date.month(1)==="February"&&date.month(13)==="February" && date.month(-14)=="November",
		"date.month(index) returns month corresponding to index, it even works with indexes>11 or negative indices");
	test.ok(date.month(1,"Short")==="Feb" && date.month(1,"abbreviation")=="F" && date.month(1,"LONG")=="February" && date.month(1,"UNkncdfj")=="February",
		"date.month(index,type) returns short,abbreviated or long monthnames, with default to long");
	
	test.ok(date.month(1,"long",false)==="January" && date.month(-13,"long",false)==="November"&& date.month(0,"long",false)==="December" && date.month(1,"long",true)==="February",
		"date.month(index,type,zeroBased) zeroBased sets base of index, defaults to true");
	test.end();
});
tape("date.isLeapYear(): returns if someyear is a leapyear", function(test){
	test.ok(date.isLeapYear(2000)&&!date.isLeapYear(1999)&&!date.isLeapYear(1900),
		"date.isLeapYear(year) returns if year is a leapyear");
	test.ok(date.isLeapYear()===date.isLeapYear(new Date().getFullYear()),
		"date.isLeapYear() returns if current year is a leapyear");
	test.ok(typeof date.isLeapYear("fdgf")==="undefined" && typeof date.isLeapYear(NaN)==="undefined" && typeof date.isLeapYear({})==="undefined" ,
		"date.isLeapYear(/*not numbers*/) returns undefiend");
	test.end();
});
tape("date().isLeapYear(): returns if year in date is a leapyear", function(test){
	var a1=!date(2018,2,1).isLeapYear();
	var a2=date(2000,2,1).isLeapYear();
	var a3=!date(1900,2,1).isLeapYear();
	var a4=date(2016,2,1).isLeapYear();
	var b=date("").isLeapYear();
	//getWeekday(index,type [default:long],zeroBased [default:true])
	test.ok(a1&&a2&&a3&&a4,
		"date().isLeapYear() returns if year of valid date is a leapyear");
	test.ok(typeof b==="undefined",
		"date().isLeapYear() returns undefined if not a valid date");
	test.end();
});
tape("date().daysInMonth(): returns number of days in the month of the date", function(test){
	var a1=(date(2018,1,1).daysInMonth()==28);
	var a2=(date(2000,1,1).daysInMonth()==29);
	var a3=(date(1900,1,1).daysInMonth()==28);
	var a4=(date(2016,1,1).daysInMonth()==29);
	var b=date("").daysInMonth();
	test.ok(a1&&a2&&a3&&a4,
		"date().daysInMonth() returns number of days in the month set for date");
	test.ok(typeof b==="undefined",
		"date().daysInMonth() returns undefined if not a valid date");
	test.end();
});
tape("date.daysInMonth(): returns the number of days for given month and year", function(test){

	var a1=(date.daysInMonth(2)==date.daysInMonth(2,new Date().getFullYear()));
	var a2=(date.daysInMonth()==date.daysInMonth(new Date().getMonth()+1,new Date().getFullYear()));
	var a3=(date.daysInMonth(1)==31);
	var a4=(date.daysInMonth(2,1900)==28);
	var a5=(date.daysInMonth(2,2016)==29);
	var b1=typeof date.daysInMonth(2,"fdf")=="undefined";
	var b2=typeof date.daysInMonth("dsf")=="undefined";
	var b3=typeof date.daysInMonth(NaN)=="undefined";
	var b4=typeof date.daysInMonth({})=="undefined";
	test.ok(a1&&a2&&a3&&a4&&a5,
		"date.daysInMonth(year) returns number of days for month (and optionally the year, defaults to curentyear)");
	test.ok(b1&&b2&&b3&&b4,
		"date.daysInMonth(/*not numbers*/) returns undefined");
	test.end();
});
