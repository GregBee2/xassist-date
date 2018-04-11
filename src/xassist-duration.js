import { object } from "@xassist/xassist-object";
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
}
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
XaDuration.prototype._keyOrder=[ 'year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond' ]
XaDuration.prototype.init=function(a){
	if (a.length===1){
		if(typeof a[0]==="string"){
			_parseDurationString(this,a[0])
		}
		else if(typeof a[0]==="number"){
			//milliseconds is default value
			this.millisecond+=a[0];
		}
		else if(typeof a[0]==="object"){
			object(this).mergeUnique(a[0]);
		}
	}
	if(a.length>1){
		a.forEach(function(val,i){
			//console.log(val,i,wantedKeys[i],this[wantedKeys[i]])
			if(i<this._keyOrder.length&&typeof val==="number"){ 
				this[this._keyOrder[i]]+=val;
			}
		},this)
	}
	
}

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
}
XaDuration.prototype.normalize=function(exact){
	exact=(typeof exact==="undefined"?true:!!exact);
	//first we normalize up to upscale the factors thats needed like 12months becomes 1 year

	
	this.normalizeUp(exact);

	//the only factor that is decimal is the one from day to month so
	//after upscaling the only attribute potentially remaining decimal is day
	//now we can normalize down to eliminate decimals
	if(!this.normalized){
		this.normalizeDown(exact)
		//this could introduce other scaling factors that should be upscaled (added hours so hours fall above 24 or lower)
		//since those all fall lower then day we should only once scale up if necessary (but we put true to be sure to not change months
		this.normalizeUp(true);
	}

	
}



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
}
XaDuration.prototype.normalizeUp=function(exact){
	var key,nextKey,factor,oldVal,i=this._keyOrder.length,normalized=true;
	exact=(typeof exact==="undefined"?true:!!exact)
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
			normalized=normalized&&((this[key]*10%10/10)===0)
		}
	}
	this.normalized=normalized;
	return this;
}
XaDuration.prototype.getConversionFactor=function(fromUnit,toUnit){
	if(_conversionCoefficients.hasOwnProperty(fromUnit)&&_conversionCoefficients.hasOwnProperty(toUnit)){
		return {
			factor:(_conversionCoefficients[toUnit].coeff/_conversionCoefficients[fromUnit].coeff),
			exact:(_conversionCoefficients[toUnit].exactType===_conversionCoefficients[fromUnit].exactType)
		}
	}
	else{
		throw typeError("Invalid unit conversion type");
	}
}
XaDuration.prototype.valueOf=function(){
	//returns number of milliseconds
	var result=0,key;
	for (var i=0,len=this._keyOrder.length;i<len;i++){
		key=this._keyOrder[i];
		result+=(this.getConversionFactor(key,"millisecond").factor*this[key]);
	}
	return result
}
XaDuration.prototype.toString=function(){
	var result=[],key,v=this.valueOf(),dur=duration(Math.abs(v));
	dur.normalize(false)
	for (var i=0,len=this._keyOrder.length;i<len;i++){
		key=this._keyOrder[i];
		if(dur[key]!==0){
			result.push(dur[key]+" "+key+(dur[key]>1?"s":""));
		}
	}
	if(v<0){
		result.push("ago")
	}
	return result.join(' ')+".";
}
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
	tolerance=Math.abs(tolerance)
	tolerance=tolerance>1?1:tolerance;
	dur.normalize(false);

	for (var i=0,len=this._keyOrder.length;i<len&&relError>=tolerance;i++){
		key=this._keyOrder[i];
		if(dur[key]!==0){
			currentVal+=dur[key]*this.getConversionFactor(key,"millisecond").factor
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
		result.push("ago")
	}
	return result.join(' ')+".";
}
XaDuration.prototype.addDuration=function(dur){
	var key,i,len;
	for (i=0,len=this._keyOrder.length;i<len;i++){
		key=this._keyOrder[i]
		if(dur.hasOwnProperty(key)&&typeof dur[key]==="number"){
			this[key]+=dur[key];
		}
	}
	return this;
}
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
}
XaDuration.prototype.normalizeMonth=function(numberOfDays){
	var dec=getDecimal(this.month);
	this.month=this.month-dec;
	this.day+=numberOfDays*dec;
	return this.normalizeDown();
}
/*console.time('parser')
for (i=0;i<10000;i++) {
	new XaDuration("14y 2milliseconds 1d 4y 13 hours 15days ");
}
console.timeEnd('parser') //takes a 50 ms for 10/000 values

console.log(new XaDuration(14.157))

var a=new XaDuration({year:157})

console.log(Object.keys(a))
console.log(new XaDuration(1,2,3,4,5,6,7,8))
console.log(new XaDuration(1,2,3,"test",5))*/

//console.log(new XaDuration("14y2milliseconds 1d 4ys 13 hours 15d")) //4ys is faulty
/*
var a=new Date(2017,2,15,0,0,10,1570);

console.log("orig date        : "+a+"\thour: "+a.getHours())
var b=new Date(a)
console.log("clone date      : "+b+"\thour: "+b.getHours())
b.setMonth(b.getMonth()+1);
console.log("1 month later : "+b+"\t\thour: "+b.getHours())
console.log("addmonth      : "+addMonths(a,1)+"\t\thour: "+addMonths(a,1).getHours())
console.log("addmonth2    : "+addMonths2(a,1)+"\t\thour: "+addMonths2(a,1).getHours())
checkAddMonths()
logTimings(checkSpeed(100000,new Date(1999,11,31)),["addMonths","addMonths2"]);
function checkSpeed(iterations,initDate){
	var res1=initDate,res2=initDate,tStart,tEnd,time1,time2,i;
	tStart = performance.now();
	for (i=0;i<iterations;i++){
		res1=addMonths(res1,1);
	}
	tEnd = performance.now();
	time1=tEnd-tStart;
	tStart = performance.now();
	for (i=0;i<iterations;i++){
		res2=addMonths2(res2,1);
	}
	tEnd = performance.now();
	time2=tEnd-tStart;
	return [
		{result:res1,timing:time1},
		{result:res2,timing:time2}
	]
}
console.log(addMonths2(new Date(),1));
console.log(addMonths2(new Date()));
console.log(addMonths2(new Date(),NaN));
function logTimings(result,names){
	console.log("Timing result")
	console.log("*********")
	result.forEach((x,i)=>x.func=names[i])
	console.table(result);
}
function checkAddMonths(){
	console.log("Checking months added")
	console.log("******************")
	
	var d=[
		[new Date(2015,0,1),1  ,'2015-2-1'],
		[new Date(2015,0,1),2  ,'2015-3-1'],
		[new Date(2015,0,1),3  ,'2015-4-1'],
		[new Date(2015,0,1),4  ,'2015-5-1'],
		[new Date(2015,1,15),1,'2015-3-15'],
		[new Date(2015,0,31), 1, '2015-2-28'],
		[new Date(2016,0,31),1, '2016-2-29'],
		[new Date(2015,0,01),11,'2015-12-1'],
		[new Date(2015,0,01),12,'2016-1-1'],
		[new Date(2015,0,01),24,'2017-1-1'],
		[new Date(2015,1,28),12,'2016-2-28'],
		[new Date(2015,2,01),12,'2016-3-1'],
		[new Date(2016,1,29),12,'2017-2-28']
	]
	for (var i=0,len=d.length;i<len;i++){

		console.log("orig date\t\t\t\t: "+d[i][0]+"\t\t\tAdd Months: "+d[i][1])
		console.log("addMonth\t\t\t: "+addMonths(d[i][0],d[i][1])+"\t\t\texpected result: "+d[i][2]+"\t\tLocaleString: "+addMonths(d[i][0],d[i][1]).toLocaleString().split(" ")[0])
		console.log("addMonth2\t\t\t: "+addMonths2(d[i][0],d[i][1])+"\t\t\texpected result: "+d[i][2]+"\t\tLocaleString: "+addMonths2(d[i][0],d[i][1]).toLocaleString().split(" ")[0])
	}
	console.log("Ended")
	console.log("*****")
	
}

function isLeapYear(year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
}

function getDaysInMonth(year, month) {
    return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

function addMonths(date, m) {
    var d = new Date(date),
        n = date.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + m);
    d.setDate(Math.min(n, getDaysInMonth(d.getFullYear(), d.getMonth())));
    return d;
}
function addMonths2(date,value){
	  var m, d = new Date(+date),day 
	if(typeof value!=="number"){
		return d
	}
	day = d.getDate()
    d.setMonth(d.getMonth() + value, 1)
    m = d.getMonth()
    d.setDate(day)
    if (d.getMonth() !== m){
		d.setDate(0)
	}
	return d
}*/

export default duration;


