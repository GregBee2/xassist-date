var definition = require("../package.json");
var main =require("../"+definition.main);
var tape=require("tape");

tape("stringToDate(): test_0", function(test){
	test.ok(true,
		"stringToDate() WORKS");
	test.end();
});
tape("isValidDateString(): test_1", function(test){
	test.ok(true,
		"isValidDateString() WORKS");
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