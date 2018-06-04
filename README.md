# 简介
一个适配移动端的日历组件
# 使用
HTML
```html
<div class="calendar" id="calendar"></div>
```
JS
```javascript
var mCalendar = new MCalendar({
      el: 'calendar',                 //dom id
      currentDate: '2018-05-01',      //初始日期
      url: '###',                     //获取事件列表接口
      eventsKey: 'events',            //事件列表字段名称
      clickUrl: '###',                //点击日期跳转路径
      clickKey: 'keyword'             //点击日期携带带参数字段
 })
```
