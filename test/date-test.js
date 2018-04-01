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
tape("date(): date creates new class instance of XaDate", function(test){
	//constrcutor is DateObj
	test.ok(date(2017,10,31).constructor.name==="XaDate" && date(2017,10,31) instanceof Date,
		"date() sets constructor to XaDate, but remains instanceof Date");
	test.end();
});


tape("date().isValid(): returns if the created date is a valid date", function(test){
	var a=date();
	
	test.ok(date("foo").isValid()===false && a.isValid() && (a.setYear('fdkjf'),!a.isValid()),
		"date().isValid() works as expected, even when chaging from a valid to an invalid date");
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
tape("date().addMonths(): adds number of months to a certain date", function(test){

	var d=[
		[date(2015,0,1),1  ,'2015-2-1 00:00:00'],
		[date(2015,0,1),2  ,'2015-3-1 00:00:00'],
		[date(2015,0,1),3  ,'2015-4-1 00:00:00'],//daylight saving
		[date(2015,0,1),4  ,'2015-5-1 00:00:00'],
		[date(2015,0,15),1,'2015-2-15 00:00:00'],
		[date(2015,0,31), 1, '2015-2-28 00:00:00'],
		[date(2016,0,31),1, '2016-2-29 00:00:00'],
		[date(2015,0,01),11,'2015-12-1 00:00:00'],
		[date(2015,0,01),12,'2016-1-1 00:00:00'],
		[date(2015,0,01),24,'2017-1-1 00:00:00'],
		[date(2015,1,28),12,'2016-2-28 00:00:00'],
		[date(2015,2,01),12,'2016-3-1 00:00:00'],
		[date(2016,1,29),12,'2017-2-28 00:00:00'],
		[date.stringToDate('2015-1-1',"YMD"),1  ,'2015-2-1 00:00:00'],
		[date.stringToDate('2015-1-1',"YMD"),2  ,'2015-3-1 00:00:00'],
		[date.stringToDate('2015-1-1',"YMD"),3  ,'2015-4-1 00:00:00'],//daylight saving
		[date.stringToDate('2015-1-1',"YMD"),4  ,'2015-5-1 00:00:00'],
		[date.stringToDate('2015-1-15',"YMD"),1,'2015-2-15 00:00:00'],
		[date.stringToDate('2015-1-31',"YMD"), 1, '2015-2-28 00:00:00'],
		[date.stringToDate('2016-1-31',"YMD"),1, '2016-2-29 00:00:00'],
		[date.stringToDate('2015-1-01',"YMD"),11,'2015-12-1 00:00:00'],
		[date.stringToDate('2015-1-01',"YMD"),12,'2016-1-1 00:00:00'],
		[date.stringToDate('2015-1-01',"YMD"),24,'2017-1-1 00:00:00'],
		[date.stringToDate('2015-2-28',"YMD"),12,'2016-2-28 00:00:00'],
		[date.stringToDate('2015-3-01',"YMD"),12,'2016-3-1 00:00:00'],
		[date.stringToDate('2016-2-29',"YMD"),12,'2017-2-28 00:00:00']
	]
	var result =d.map(x=>({
		orig:x[0].toLocaleString(),
		expected:x[2],
		value:x[1],
		comp:x[0].addMonths(x[1]).toLocaleString()==x[2]
	}));
	result.forEach(function(x){
		if(x.expected=='2017-2-28 00:00:00'){
			x.orig='2016-2-28 00:00:00'
		}
		else if(x.expected=='2016-2-29 00:00:00'){
			x.orig='2016-1-29 00:00:00'
		}
		else if(x.expected=='2015-2-28 00:00:00'){
			x.orig='2015-1-28 00:00:00'
		}
		x.compInv=(date.stringToDate(x.expected,"YMD").addMonths(-x.value).toLocaleString()==x.orig)
	})

	test.ok(result.every(x=>x.comp===true),
		"date().addMonths(month) adds correct number of months and takes care of edge case (leap years, daylight savings,...)"
	);
	test.ok(result.every(x=>x.compInv===true),
		"date().addMonths(-month) works with negative numbers"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addMonths({}).toLocaleString().split(' ')[0]==="2016-2-29",
		"date().addMonths(/*typeof !==number*/) does not add anything"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addMonths(NaN).isValid()===false,
		"date().addMonths(NaN) returns invalid date"
	);
	test.end();
});
tape("date().addYears(): adds number of years to a certain date", function(test){

	var d=[
		[date.stringToDate('2015-1-1',"YMD"),1  ,'2016-1-1 00:00:00'],
		[date.stringToDate('2015-1-1',"YMD"),2  ,'2017-1-1 00:00:00'],
		[date.stringToDate('2015-1-1',"YMD"),3  ,'2018-1-1 00:00:00'],
		[date.stringToDate('2015-1-1',"YMD"),4  ,'2019-1-1 00:00:00'],
		[date.stringToDate('2015-1-15',"YMD"),1,'2016-1-15 00:00:00'],
		[date.stringToDate('2015-1-31',"YMD"), 1, '2016-1-31 00:00:00'],
		[date.stringToDate('2016-1-31',"YMD"),1, '2017-1-31 00:00:00'],
		[date.stringToDate('2015-1-01',"YMD"),11,'2026-1-1 00:00:00'],
		[date.stringToDate('2015-1-01',"YMD"),12,'2027-1-1 00:00:00'],
		[date.stringToDate('2015-1-01',"YMD"),24,'2039-1-1 00:00:00'],
		[date.stringToDate('2015-2-28',"YMD"),85,'2100-2-28 00:00:00'],
		[date.stringToDate('2015-3-01',"YMD"),1,'2016-3-1 00:00:00'],
		[date.stringToDate('2016-2-29',"YMD"),1,'2017-2-28 00:00:00']
	]
	var result =d.map(x=>({
		orig:x[0].toLocaleString(),
		expected:x[2],
		value:x[1],
		comp:x[0].addYears(x[1]).toLocaleString()==x[2]
	}));
	result.forEach(function(x){
		if(x.expected=='2017-2-28 00:00:00'){
			x.orig='2016-2-28 00:00:00'
		}
		x.compInv=(date.stringToDate(x.expected,"YMD").addYears(-x.value).toLocaleString()==x.orig)
	})

	test.ok(result.every(x=>x.comp===true),
		"date().addYears(year) adds correct number of years and takes care of edge case (leap years, daylight savings,...)"
	);
	test.ok(result.every(x=>x.compInv===true),
		"date().addYears(-year) works with negative numbers"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addYears({}).toLocaleString().split(' ')[0]==="2016-2-29",
		"date().addYears(/*typeof !==number*/) does not add anything"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addYears(NaN).isValid()===false,
		"date().addYears(NaN) returns invalid date"
	);
	test.end();
});
tape("date().addDays(): adds number of days to a certain date", function(test){

	var d=[
		[date.stringToDate('2015-1-1',"YMD"),1  ,'2015-1-2 00:00:00'],
		[date.stringToDate('2018-3-25',"YMD"),1  ,'2018-3-26 00:00:00'], //daylightSaving
		[date.stringToDate('2016-2-29',"YMD"),1,'2016-3-1 00:00:00'],
		[date.stringToDate('2016-2-29',"YMD"),15,'2016-3-15 00:00:00'],
		[date.stringToDate('2015-2-28',"YMD"),366,'2016-2-29 00:00:00'],
		[date.stringToDate('2016-2-29',"YMD"),366,'2017-3-1 00:00:00']
	]
	var result =d.map(x=>({
		orig:x[0].toLocaleString(),
		expected:x[2],
		value:x[1],
		comp:x[0].addDays(x[1]).toLocaleString()==x[2]
	}));
	result.forEach(function(x){
		x.compInv=(date.stringToDate(x.expected,"YMD").addDays(-x.value).toLocaleString()==x.orig)
	})
	test.ok(result.every(x=>x.comp===true),
		"date().addDays(day) adds correct number of days and takes care of edge case (leap years, daylight savings,...)"
	);
	test.ok(result.every(x=>x.compInv===true),
		"date().addDays(-day) works with negative numbers"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addDays({}).toLocaleString().split(' ')[0]==="2016-2-29",
		"date().addDays(/*typeof !==number*/) does not add anything"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addDays(NaN).isValid()===false,
		"date().addDays(NaN) returns invalid date"
	);
	test.end();
});

tape("date().addHours(): adds number of hours to a certain date", function(test){

	var d=[
		[date.stringToDate('2015-1-1 00:00:00',"YMD"),1  ,'2015-1-1 01:00:00'],
		[date.stringToDate('2018-3-25 00:00:00',"YMD"),3  ,'2018-3-25 03:00:00'], //daylightSaving
		[date.stringToDate('2016-2-29 23:00:00',"YMD"),1,'2016-3-1 00:00:00'],
		[date.stringToDate('2016-2-29 00:00:00',"YMD"),47,'2016-3-1 23:00:00'],
		[date.stringToDate('2015-2-28 00:00:00',"YMD"),(366*24),'2016-2-29 00:00:00'],
		[date.stringToDate('2016-2-29 00:00:00',"YMD"),((366*24)+1),'2017-3-1 01:00:00']
	]
	var result =d.map(x=>({
		orig:x[0].toLocaleString(),
		expected:x[2],
		value:x[1],
		comp:x[0].addHours(x[1]).toLocaleString()==x[2]
	}));
	result.forEach(function(x){
		x.compInv=(date.stringToDate(x.expected,"YMD").addHours(-x.value).toLocaleString()==x.orig)
	})
	test.ok(result.every(x=>x.comp===true),
		"date().addHours(hours) adds correct number of hours and takes care of edge case (leap years, daylight savings,...)"
	);
	test.ok(result.every(x=>x.compInv===true),
		"date().addHours(-hours) works with negative numbers"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addHours({}).toLocaleString()==="2016-2-29 00:00:00",
		"date().addHours(/*typeof !==number*/) does not add anything"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addHours(NaN).isValid()===false,
		"date().addHours(NaN) returns invalid date"
	);
	test.end();
});
tape("date().addMinutes(): adds number of minutes to a certain date", function(test){

	var d=[
		[date.stringToDate('2015-1-1 00:00:00',"YMD"),121  ,'2015-1-1 02:01:00'],
		[date.stringToDate('2018-3-25 00:00:00',"YMD"),184  ,'2018-3-25 03:04:00'], //daylightSaving
		[date.stringToDate('2016-2-29 23:59:00',"YMD"),1,'2016-3-1 00:00:00'],
		[date.stringToDate('2016-2-29 00:00:00',"YMD"),47*60+1,'2016-3-1 23:01:00'],
		[date.stringToDate('2015-2-28 00:00:00',"YMD"),(366*24*60),'2016-2-29 00:00:00'],
		[date.stringToDate('2016-2-29 00:00:00',"YMD"),((366*24)+1)*60+1,'2017-3-1 01:01:00']
	]
	var result =d.map(x=>({
		orig:x[0].toLocaleString(),
		expected:x[2],
		value:x[1],
		comp:x[0].addMinutes(x[1]).toLocaleString()==x[2]
	}));
	result.forEach(function(x){
		x.compInv=(date.stringToDate(x.expected,"YMD").addMinutes(-x.value).toLocaleString()==x.orig)
	})
	test.ok(result.every(x=>x.comp===true),
		"date().addMinutes(minutes) adds correct number of minutes and takes care of edge case (leap years, daylight savings,...)"
	);
	test.ok(result.every(x=>x.compInv===true),
		"date().addMinutes(-minutes) works with negative numbers"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addMinutes({}).toLocaleString()==="2016-2-29 00:00:00",
		"date().addMinutes(/*typeof !==number*/) does not add anything"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addMinutes(NaN).isValid()===false,
		"date().addMinutes(NaN) returns invalid date"
	);
	test.end();
});
tape("date().addSeconds(): adds number of seconds to a certain date", function(test){

	var d=[
		[date.stringToDate('2015-1-1 00:00:00',"YMD"),121*60+11  ,'2015-1-1 02:01:11'],
		[date.stringToDate('2018-3-25 00:00:00',"YMD"),184*60+13  ,'2018-3-25 03:04:13'], //daylightSaving
		[date.stringToDate('2016-2-29 23:59:59',"YMD"),1,'2016-3-1 00:00:00'],
		[date.stringToDate('2016-2-29 00:00:00',"YMD"),(47*60+1)*60+1,'2016-3-1 23:01:01'],
		[date.stringToDate('2015-2-28 00:00:00',"YMD"),(366*24*60*60),'2016-2-29 00:00:00'],
		[date.stringToDate('2016-2-29 00:00:00',"YMD"),(((366*24)+1)*60+1)*60+1,'2017-3-1 01:01:01']
	]
	var result =d.map(x=>({
		orig:x[0].toLocaleString(),
		expected:x[2],
		value:x[1],
		comp:x[0].addSeconds(x[1]).toLocaleString()==x[2]
	}));
	result.forEach(function(x){
		x.compInv=(date.stringToDate(x.expected,"YMD").addSeconds(-x.value).toLocaleString()==x.orig)
	})
	test.ok(result.every(x=>x.comp===true),
		"date().addSeconds(seconds) adds correct number of seconds and takes care of edge case (leap years, daylight savings,...)"
	);
	test.ok(result.every(x=>x.compInv===true),
		"date().addSeconds(-seconds) works with negative numbers"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addSeconds({}).toLocaleString()==="2016-2-29 00:00:00",
		"date().addSeconds(/*typeof !==number*/) does not add anything"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addSeconds(NaN).isValid()===false,
		"date().addSeconds(NaN) returns invalid date"
	);
	test.end();
});
tape("date().addMilliseconds(): adds number of milliseconds to a certain date", function(test){

	var d=[
		[date.stringToDate('2015-1-1 00:00:00',"YMD"),(121*60+11)*1000 ,'2015-1-1 02:01:11'],
		[date.stringToDate('2018-3-25 00:00:00',"YMD"),(184*60+13)*1000  ,'2018-3-25 03:04:13'], //daylightSaving
		[date.stringToDate('2016-2-29 23:59:59',"YMD"),1000,'2016-3-1 00:00:00'],
		[date.stringToDate('2016-2-29 00:00:00',"YMD"),((47*60+1)*60+1)*1000,'2016-3-1 23:01:01'],
		[date.stringToDate('2015-2-28 00:00:00',"YMD"),(366*24*60*60*1000),'2016-2-29 00:00:00'],
		[date.stringToDate('2016-2-29 00:00:00',"YMD"),((((366*24)+1)*60+1)*60+1)*1000,'2017-3-1 01:01:01']
	]
	var result =d.map(x=>({
		orig:x[0].toLocaleString(),
		expected:x[2],
		value:x[1],
		comp:x[0].addMilliseconds(x[1]).toLocaleString()==x[2],
		
	}));
	result.forEach(function(x){
		x.compInv=(date.stringToDate(x.expected,"YMD").addMilliseconds(-x.value).toLocaleString()==x.orig)
	})
	test.ok(result.every(x=>x.comp===true),
		"date().addMilliseconds(milliSeconds) adds correct number of milliseconds and takes care of edge case (leap years, daylight savings,...)"
	);
	test.ok(result.every(x=>x.compInv===true),
		"date().addMilliseconds(-milliSeconds) works with negative numbers"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addMilliseconds({}).toLocaleString()==="2016-2-29 00:00:00",
		"date().addMilliseconds(/*typeof !==number*/) does not add anything"
	);
	test.ok(date.stringToDate('2016-2-29',"YMD").addMilliseconds(NaN).isValid()===false,
		"date().addMilliseconds(NaN) returns invalid date"
	);
	test.end();
});
tape("date().add(): adds duration to date", function(test){
	var a=date.stringToDate('2016-2-29 00:00:00',"YMD");
	var b=date.stringToDate('2016-2-29 00:00:00',"YMD");

	
	a.add("1.5y 3.10M 5d 47h 61.20m 13.157s 1243ms")
	b.add("1.5y 3.10M 5d 47h 61.20m 13.157s 1243ms",false)
	test.ok(a.toLocaleString()=="2017-12-9 00:01:26" && a.getMilliseconds()===399,
		"date().add() adds correct duration to date "
	);
	test.ok(b.toLocaleString()=="2017-12-10 02:25:26" && b.getMilliseconds()===399,
		"date().add(duration,false) adds correct duration with first calculating the small units"
	);
	//false adds extra day because first adding year to 29 feb gives us 28feb if we add 1 month and then 1 day we get 30 march (true)
	//	if we first add days we get eg 1 march adding 1year and 1 month gives us 01 april!
	//false changes the rounding of the month => 0.1*31=>3.1 days instead of 3 days so extra 2hr 24min
	a=date.stringToDate('2017-12-9 00:01:26.399',"YMD");
	b=date.stringToDate('2017-12-9 00:01:26.399',"YMD");

	b.add("-1.5y -3.10M -5d -47h -61.20m -13.157s -1243ms",false)
	a.add("-1.5y -3.10M -5d -47h -61.20m -13.157s -1243ms")
	test.ok(a.toLocaleString()=="2016-2-27 21:36:00" && a.getMilliseconds()===0,
		"date().add() adds correct duration to date even with negative figures"
	);
	test.ok(b.toLocaleString()=="2016-2-28 21:36:00" && b.getMilliseconds()===0,
		"date().add(duration,false) adds correct duration with first calculating the small units even with negative figures"
	);
	/*
	2017	-1y								2016
	12		-9.1m							3=>march has 31 days=>3.1d=>
	9			-5d								-5-3=>1march-2d=28
	0			-47h								47+2.4hr(months)=>49=>2d=>-2hr from 60m =>22=>21 because we overflow the minutes
	1			-61m							60-0.4*60=36
	26		-25s								0
	399		-1399.9999ms				0
	
	2016	+1y								2017
	02		+9.1m							11 => nov has 30days=>3d=>+add month from days=>12
	29		+5d								07 +24hr=>08 +24hr=>09
	0			+47h							23hr +60m =>24hr =>0
	0			+61m							1
	0			+25s							25+1s=>26
	0			+1399.9999ms			399
	*/
	test.end();
})
tape("date().format(): returns formatted date time string", function(test){
	var a=date();
	console.log(a.format("^y:y ^yy:yy ^yyy:yyy ^yyyy:yyyy" ));
	console.log(a.format("^d:d ^dd:dd ^ddd:ddd ^dddd:dddd ^ddddd:ddddd ^dddddddddddddddddd:ddddddddddddddddddddd" ));
	console.log(a.format("^M:M ^MM:MM ^Mm:Mm ^mmm:mmm ^mmmm:mmmm ^mmmmm:mmmmm ^mmmmmmmmmm:mmmmmmmmmmmm" ));
	console.log(a.format("^h:h ^hh:hh ^hhh:hhh"));
	console.log(a.format("^m:m ^mm:mm ^mmm:mmm"));
	console.log(a.format("^s:s ^ss:ss ^sss:sss"));
	console.log(a.format("^.:. ^.0:.0 ^.00:.00 ^.000:.000 ^.0000:.0000"));
	console.log(a.format("^,:, ^,0:,0 ^,00:,00 ^,000:,000 ^,0000:,0000"));
	
	test.ok(true,
		"date.format(\"y yy yyy yyyy\") returns correct year"
	);
	test.end();
})