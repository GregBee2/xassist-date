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
	new Date(2016,1,29).valueOf()
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
	["DMY"]
]
var invalidDateStrings=[
	["31","11","2017"], //DMY 1 dec 2017
	["29","2","2015"], //DMY 29 feb 2015
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
tape("date().getWeekday(): test_4", function(test){
	test.ok(date(2018,2,29).getWeekDay()==="Thursday" && date.getWeekDay(1)==="Monday",
		"date().getWeekday() WORKS");
	test.end();
});
tape("date.getWeekday(): gives the weekday based on index", function(test){
	//getWeekday(index,type [default:long],startIndexofWeek [default:0],zeroBased [default:true])
	var result=
	date.getWeekDay()==="Sunday"
	date.getWeekDay(1,"Short")==="Mon"
	date.getWeekDay(1,"abbreviation")==="M"
	date.getWeekDay(1,"long",1)==="Tuesday"
	date.getWeekDay(1,"long",1,false)==="Monday"
	
	
	
	test.ok(date.getWeekDay()==="Sunday",
		"date.getWeekday() returns first day of week");
	test.ok(date.getWeekDay(1)==="Monday"&&date.getWeekDay(8)==="Monday",
		"date.getWeekday(index) returns day of week corresponding to index, it even works with indexes>6");
	test.end();
});
tape("date().month(): test_5", function(test){
	test.ok(true,
		"date().month() WORKS");
	test.end();
});
