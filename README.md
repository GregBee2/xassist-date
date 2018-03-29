# @xassist/xassist-date
helper functions for date manipulation
## Installation

If you use [NPM](https://www.npmjs.com/), you can install the module via `npm install xassist-date`. Otherwise, you can download the latest [minified file](https://raw.githubusercontent.com/GregBee2/xassist-date/master/dist/xAssist-date.min.js). Be aware any dependencies are not installed by default; you should consider downloading them yourself.
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
`date.isValidDateString()` requires no parameters.
`date.isValidDateString()` returns nothing.
### date.stringToDate()

takes a valid datestring and constructs a new Enhanced Date-instance
```js
date.stringToDate(dateStr::String)
```
`date.stringToDate()` requires no parameters.
`date.stringToDate()` returns nothing.
### date()

The base function date() creates a new Class instance which gives access to some helper Date-functions
```js
date();
date(value::number);
date(dateString::string);
date(year::number, month::number[, day::number[, hour::number[, minutes::number[, seconds::number[, milliseconds::number]]]]]);
```
`date()` requires no parameters.
`date()` returns nothing.
### date().isValid()

checks if the date-instance is valid.
```js
date().isValid()
```
`date().isValid()` requires no parameters.
`date().isValid()` returns nothing.
### date().getWeekday()

returns the weekday of the current date-Instance
```js
date().getWeekday([type::string])
```
`date().getWeekday()` requires no parameters.
`date().getWeekday()` returns nothing.
### date.getWeekday()

gets the name of the day for a given index
```js
date.getWeekday([index::number[,type::string[,startIndexofWeek::number[,zeroBased::boolean]]]])
```
`date.getWeekday()` requires no parameters.
`date.getWeekday()` returns nothing.
### date().month()

gets the name of the month for the given date-instance
```js
date().month([type::string])
```
`date().month()` requires no parameters.
`date().month()` returns nothing.
### date.month()

gives the name of the month based on an index given.
```js
date.month([index::number[,type::string[,zeroBased::boolean]]])
```
`date.month()` requires no parameters.
`date.month()` returns nothing.
### date().isLeapYear()

checks if the date-instance dalls in a leapyear
```js
date().isLeapYear()
```
`date().isLeapYear()` requires no parameters.
`date().isLeapYear()` returns nothing.
### date.isLeapYear()

Checks if the year provided is a leapyear.
```js
date.isLeapYear([year::number])
```
`date.isLeapYear()` requires no parameters.
`date.isLeapYear()` returns nothing.
### date().daysInMonth()

returns the number of days for the current date-instance
```js
date().daysInMonth()
```
`date().daysInMonth()` requires no parameters.
`date().daysInMonth()` returns nothing.
### date.daysInMonth()

returns the number of days in a given month for a given year.
```js
date().daysInMonth([month::number[,year::number]])
```
`date.daysInMonth()` requires no parameters.
`date.daysInMonth()` returns nothing.
## DevDependencies
- [csv2readme](https://github.com/GregBee2/csv2readme#readme): read csv file with fixed format and parse a readme markdown file
- [rimraf](https://github.com/isaacs/rimraf#readme): A deep deletion module for node (like `rm -rf`)
- [rollup](https://github.com/rollup/rollup): Next-generation ES6 module bundler
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers
## License

This module is licensed under the terms of [GPL-3.0](https://choosealicense.com/licenses/gpl-3.0).
