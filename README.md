# @xassist/xassist-date
helper functions for date manipulation
## Installation

If you use [NPM](https://www.npmjs.com/), you can install the module via `npm install xassist-date`. Otherwise, you can download the latest [minified file](https://raw.githubusercontent.com/GregBee2/xassist-date/master/dist/xassist-date.min.js). Be aware any dependencies are not installed by default; you should consider downloading them yourself.
If you want, you can install the complete library from github [@xassist](https://github.com/GregBee2/xassist), this includes all dependencies you may need.

The module uses [UMD](https://github.com/umdjs/umd) and supports [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD), [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) and vanilla environments. Using vanilla: the `xa`global is exported:

```html
<script>
xa.date()
</script>
```



## API
### date.isValidDateString()

validates a datestring
```js
date.isValidDateString(dateStr::String)
```
`date.isValidDateString()` returns nothing.
#### Parameters for date.isValidDateString()
`date.isValidDateString()` takes 1 parameters:
- **dateStr** [`String`]:a dateString which must follows the given requirements
  - the format may be DMY (little Endian),YMD (big Endian),MDY (middle Endian, American notation) or YDM (very rare notation, used in eg Latvia)
  - the date delimiters can be "/","\","-" or a point (".")
  - timestrings can be appended to the date (when  preceded by a space or a "T")
  - the time should be given in 24hrs-notation (eg 00:00:00,000 untill 23:59:59,99999999)
  - every part in the timestamp should be prefixed with a zero
  - every part of the time is optional
  - milliseconds (or even smaller) can be given after the seconds with a delimiter of "." or ","
### date.stringToDate()

takes a valid datestring and constructs a new Enhanced Date-instance
```js
date.stringToDate(dateStr::String)
```
#### Parameters for date.stringToDate()
`date.stringToDate()` takes 1 parameters:
- **dateStr** [`String`]:a dateString which must follows the given requirements
  - the format may be DMY (little Endian),YMD (big Endian),MDY (middle Endian, American notation) or YDM (very rare notation, used in eg Latvia)
  - the date delimiters can be "/","\","-" or a point (".")
  - timestrings can be appended to the date (when  preceded by a space or a "T")
  - the time should be given in 24hrs-notation (eg 00:00:00,000 untill 23:59:59,99999999)
  - every part in the timestamp should be prefixed with a zero
  - every part of the time is optional
  - milliseconds (or even smaller) can be given after the seconds with a delimiter of "." or ","
#### Result for date.stringToDate()
`date.stringToDate()` returns a new class instance of the Class `XaDate`
```js
date.stringToDate(a).constructor.name==="XaDate"
```
`XaDate` returns 5 method:
- `isValid()`: checks if this is  a valid Date
- `getWeekday()`: returns the name of the day for the given date
- `month()`: returns the name of the month of the given date
- `isLeapYear()`: checks if the current date falls in a leapyear
- `daysInMonth()`: returns the number of days in the month for the given date.

`XaDate` has 1 own attributes:
- `this`[`Date`]:The complete instance is an instance of Date so it inherits all methods of the JavaScript `Date`-object
### date()

The base function date() creates a new Class instance which gives access to some helper Date-functions
```js
date();
date(value::number);
date(dateString::string);
date(year::number, month::number[, day::number[, hour::number[, minutes::number[, seconds::number[, milliseconds::number]]]]]);
```
#### Parameters for date()
`date()` takes 1 parameters:
- *`/*multiple possiblilities*/`* [*any datatype*]:the parameters for date() should be entered in the same manner as for a javascript [Date-object](https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Global_Objects/Date). This means it can be one off the following:
  - *empty*: the function will return the curret datetimestamp
  - **value** [number]: Numerical value of the milliseconds since 1st Jan 1970 00:00:00UTC
  - **dateString** [string]: textual representation of the date, it should be in a format that `Date.parse()`understands.
  - **year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]]** [[numbers]: the different parts of the datetimestamp
#### Result for date()
`date()` returns a new class instance of the Class `XaDate`
```js
date(a).constructor.name==="XaDate"
```
`XaDate` returns 5 method:
- `isValid()`: checks if this is  a valid Date
- `getWeekday()`: returns the name of the day for the given date
- `month()`: returns the name of the month of the given date
- `isLeapYear()`: checks if the current date falls in a leapyear
- `daysInMonth()`: returns the number of days in the month for the given date.

`XaDate` has 1 own attributes:
- `this`[`Date`]:The complete instance is an instance of Date so it inherits all methods of the JavaScript `Date`-object
### date().isValid()

checks if the date-instance is valid.
```js
date().isValid()
```
`date().isValid()` requires no parameters.
#### Result for date().isValid()
This method returns a Boolean indicating if it is a valid date
### date().getWeekday()

returns the weekday of the current date-Instance
```js
date().getWeekday([type::string])
```
#### Parameters for date().getWeekday()
`date().getWeekday()` takes 1 parameters:
- *type* [`String`,defaults to: `"long"`]:type of the weekday we want to return
  - *long* : eg Monday
  - *short*: eg Mon
  - *abbreviation*: eg M
#### Result for date().getWeekday()
the method returns a string with the name of the day
### date.getWeekday()

gets the name of the day for a given index
```js
date.getWeekday([index::number[,type::string[,startIndexofWeek::number[,zeroBased::boolean]]]])
```
#### Parameters for date.getWeekday()
`date.getWeekday()` takes 4 parameters:
- *index* [`Number`,defaults to: `0`]:the index of the day, for which we want to get the dayname (can be negative or  larger then 7)
- *type* [`String`,defaults to: `"long"`]:type of the weekday we want to return
  - *long* : eg Monday
  - *short*: eg Mon
  - *abbreviation*: eg M
- *startIndexofWeek* [`Number`,defaults to: `0`]:the week starts normally with Sunday, to change this behaviour we can set a starting index (eg 1 starts the weekday on Monday)
- *zeroBased* [`Boolean`,defaults to: `true`]:the indexes are normally zerobased, we can set this to `false`to get a one-based value
#### Result for date.getWeekday()
the function returns a string with the name of the day
### date().month()

gets the name of the month for the given date-instance
```js
date().month([type::string])
```
#### Parameters for date().month()
`date().month()` takes 1 parameters:
- *type* [`String`,defaults to: `"long"`]:type of the mothname we want to return
  - *long* : eg January
  - *short*: eg Jan
  - *abbreviation*: eg J
#### Result for date().month()
the method returns a string with the name of the month
### date.month()

gives the name of the month based on an index given.
```js
date.month([index::number[,type::string[,zeroBased::boolean]]])
```
#### Parameters for date.month()
`date.month()` takes 3 parameters:
- *index* [`Number`,defaults to: `0`]:the index of the month for which we want to get the name (can be negative or  larger then 12)
- *type* [`String`,defaults to: `"long"`]:type of the mothname we want to return
  - *long* : eg January
  - *short*: eg Jan
  - *abbreviation*: eg J
- *zeroBased* [`Boolean`,defaults to: `true`]:the indexes are normally zerobased, we can set this to `false`to get a one-based value
#### Result for date.month()
the function returns a string with the name of the month
### date().isLeapYear()

checks if the date-instance dalls in a leapyear
```js
date().isLeapYear()
```
`date().isLeapYear()` requires no parameters.
#### Result for date().isLeapYear()
This method returns a Boolean indicating if it the date corresponds to a leap year.
### date.isLeapYear()

Checks if the year provided is a leapyear.
```js
date.isLeapYear([year::number])
```
#### Parameters for date.isLeapYear()
`date.isLeapYear()` takes 1 parameters:
- *year* [`Number`,defaults to: `current year`]:the year for which we want to check if it is leap year.
#### Result for date.isLeapYear()
This function returns a Boolean indicating if a given year corresponds to a leap year.
### date().daysInMonth()

returns the number of days for the current date-instance
```js
date().daysInMonth()
```
`date().daysInMonth()` requires no parameters.
#### Result for date().daysInMonth()
This method returns a Number  indicatingthe number of days for the given date.
### date.daysInMonth()

returns the number of days in a given month for a given year.
```js
date().daysInMonth([month::number[,year::number]])
```
#### Parameters for date.daysInMonth()
`date.daysInMonth()` takes 2 parameters:
- *month* [`Number`,defaults to: `current month (not zerobased!)`]:the month for which we want to calulate the number of days
- *year* [`Number`,defaults to: `current year`]:the year for which we want to calulate the number of days (only needed for February)
#### Result for date.daysInMonth()
This function returns a Number indicating the number of days for a given month and year.
## DevDependencies
- [csv2readme](https://github.com/GregBee2/csv2readme#readme): read csv file with fixed format and parse a readme markdown file
- [rimraf](https://github.com/isaacs/rimraf#readme): A deep deletion module for node (like `rm -rf`)
- [rollup](https://github.com/rollup/rollup): Next-generation ES6 module bundler
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers
## License

This module is licensed under the terms of [GPL-3.0](https://choosealicense.com/licenses/gpl-3.0).
