var csv2readme = require('csv2readme');

var options={
	input:{
		base:"../../helpData/csv/base.csv",
		functionParam:"../../helpData/csv/functionParameters.csv",
		classDef:"../../helpData/csv/classDefinition.csv"
	},
	moduleName:"xassist-date",
	globalTOC:false,
	header:{
		title:"@xassist/xassist-date",
		explanation:"helper functions for date manipulation"
	},
	headerFiles:["../../helpData/markdown/installationModule.md"],
	includeDependencies:true,
	includeLicense:true,
	footerFiles:[],
	subTitle:"API",
	output:{
		file:"README.md"
	},
	baseLevel:3,
	headerTemplates:{
		moduleName:"xassist-date",
		moduleUrl:"https://raw.githubusercontent.com/GregBee2/xassist-date/master/dist/xassist-date.min.js",
		libraryName:"@xassist",
		libraryUrl:"https://github.com/GregBee2/xassist",
		moduleTest:"date()"
	},
	footerTemplates:{
	}
};
csv2readme.init(options);