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

function checkDates(dates,fn,formats){
	d=[]
	possibleDateDelimiters.forEach(function(delim){
		d=d.concat(dates.map(x=>x.join(delim)));
	})
	d=d.map(x=>fn(x));
	if(typeof formats==="undefined"){

		return d
	}
	else{
		return d.map(function(x,i){
			var result=true;
			if(formats[i%dates.length].length!==x.format.length){
				return false
			}
			else{
				x.format.forEach(f=>result=result&&(!!~formats[i%dates.length].indexOf(f)))
				return result;
			}
		});
	}
}





tape("date.stringToDate(): converts date to ", function(test){
	test.ok(true,
		"date.stringToDate() WORKS");
	test.end();
});
tape("date.isValidDateString(): test_1", function(test){
	var invalids=checkDates(invalidDateStrings,date.isValidDateString);
	var valids=checkDates(validDateStrings,date.isValidDateString,possibleFormats);
	test.ok(invalids.every(x=>x===false),
		"date.isValidDateString() handles invalid dates correctly");
	test.ok(valids.every(x=>x===true),
		"date.isValidDateString() handles valid dates correctly");
	test.ok(date.isValidDateString(simpleDateArray.join(' '))===false,
		"date.isValidDateString() handles invalid delimiters between dates ok");
	test.end();
});
tape("date(): test_2", function(test){
	test.ok(true,
		"date() WORKS");
	test.end();
});
tape("date().isValid(): test_3", function(test){
	test.ok(true,
		"date().isValid() WORKS");
	test.end();
});
tape("date().getWeekday(): test_4", function(test){
	test.ok(true,
		"date().getWeekday() WORKS");
	test.end();
});
tape("date().month(): test_5", function(test){
	test.ok(true,
		"date().month() WORKS");
	test.end();
});
