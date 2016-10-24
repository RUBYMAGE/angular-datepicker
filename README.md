# Angular datepicker

RM-DATEPICKER is a directive for angular js. It allows you to render a responsive datepicker inline or as a modal on input focus.
The rm-datepicker is very nice, is responsive, fast and user friendly.
It is well optimized and lightweight (around 5 kb) and has no other dependencies than Angular itself.

###### Tags:

angular.js datepicker, angularjs datepicker, angular datepicker, angular-datepicker, pickadate, datepicker , timepicker, 
pikaday, datepicker directive, datepicker add-on, simple datepicker, clean datepicker, fluid datepicker, 
customizable datepicker, inline datepicker, dropdown datepicker, modal datepicker, lightweight datepicker, 
datepicker component

### Demo

<a href="http://plnkr.co/edit/dppNew?p=preview" target="_blank">Try it on Plunker</a>

### Usage

1) Add the `rmDatepicker` module to your dependencies

```javascript
angular.module('myApp', ['rmDatepicker']);
```

2) Use the `rm-datepicker` directive in any element

```html
<div rm-datepicker ng-model="oDate"></div>
```

### Configuration

#### Scope configuration

```html
<div rm-datepicker ng-model="oDate1" rm-config="rmConfig1"></div>
```

```javascript
function MyAppController($scope) {
    $scope.rmConfig1 = {
        mondayStart: false,
        initState : "month", /* decade || year || month */
        maxState : "decade",
        minState : "month",
        decadeSize: 12,
        monthSize: 42, /* "auto" || fixed nr. (35 or 42) */
        min: new Date("2010-10-10"),
        max: null,
        format: "yyyy-MM-dd" /* https://docs.angularjs.org/api/ng/filter/date */
    }
    $scope.oDate1 = new Date();
}
```

#### Global configuration

```javascript
app.config(['rmDatepickerConfig', function(rmDatepickerConfig) {
    rmDatepickerConfig.mondayStart = true;
    rmDatepickerConfig.initState : "month";
    /* ... */
}]);
```

## License

RM-DATEPICKER is under MIT license:

> Copyright (C) 2015 Sergiu Ghenciu, RUBYMAGE
>
> Permission is hereby granted, free of charge, to any person
> obtaining a copy of this software and associated documentation files
> (the "Software"), to deal in the Software without restriction,
> including without limitation the rights to use, copy, modify, merge,
> publish, distribute, sublicense, and/or sell copies of the Software,
> and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
> BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
> ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
