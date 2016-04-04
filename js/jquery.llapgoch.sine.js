jQuery.widget('llapgoch.sinewave', {
    options:{
        circleDiameter: 5,
        stageSize: 600,
        containerCircleClass: 'containerCircle',
        circleClass: 'circle',
        amount: 100,
        updateInterval: 1,
        moveAmount: 0.005,
        updateMethod: function(a, angleInterval){
            //return Math.cos(a) * Math.PI * a;
            return Math.sin((angleInterval * (Math.PI / 180))) * a;
        }
    },

    containerCircle: null,
    containerCircles: null,
    updateId: null,
    sineCount: 0,
    circles:[],
    mainOffset: 0,

    _create: function(){
        this.enable();
    },

    _init: function(){
        this._refresh();
    },

    _refresh: function() {
        var circle;

        this.element
            .width(this.options.stageSize)
            .height(this.options.stageSize)
            .css('border', '1px solid red');

        if (!this.containerCircle) {
            this.containerCircle = $('<div />');
        }

        if(!this.containerCircles){
            this.containerCircles = $('<div />');
        }

        this.containerCircle.addClass(this.options.containerCircleClass)
            .width(this.options.stageSize)
            .height(this.options.stageSize);


        this.element
            .append(this.containerCircle)
            .append(this.containerCircles);

        for(var a = 0; a < this.circles.length; a++){
            this.circles[a].remove();
        }

        this.circles = [];

        for(var i = 0; i < this.options.amount; i++){
            if(this.circles[i]){
                continue;
            }
            circle = $('<div />')
                .addClass(this.options.circleClass)
                .width(this.options.circleDiameter)
                .height(this.options.circleDiameter);

            this.circles[i] = circle;
            this.containerCircles.append(circle);
        }



    },

    enable: function(){
        this._start();
    },

    disable: function(){
        this._stop();
    },

    _start: function(){
        if(this.updateId){
            return;
        }

        var self = this;

        this.updateId = window.setInterval(function(){
            self._update();
        }, this.options.updateInterval);

    },

    _stop: function(){
        if(this.updateId){
            window.clearInterval(this.updateId);
        }
    },

    _setOption: function(key, value){
        this._superApply(arguments);
        this._refresh();
    },

    _distanceBetweenPoints: function(point1, point2){
       // console.log(point1, point2)
        var xOffset = point1.x - point2.x;
        var yOffset = point1.y - point2.y;

      //  console.log(point1.x - point2.x);

        return Math.sqrt((xOffset * yOffset) + (yOffset * yOffset));
    },

    up: function(){
        this.mainOffset += 0.1;
        console.log(this.mainOffset);
        this._update();
    },

    _update: function(){
        var self = this;
        var cRadius = this.options.circleDiameter / 2;
        var midPoint = (this.options.stageSize / 2) - cRadius;
        var xPos = (self.options.stageSize / 2) - cRadius;

        var angleInterval = 360 / this.circles.length / 2;
        var angle = 0;

        var mid = {
            x: midPoint,
            y: midPoint
        };

        var zero = {
            x: 0,
            y: 0
        };

        $(this.circles).each(function(i){
            var a = i + 1;
            var offset = self.options.updateMethod(a, angleInterval);
            var sinPos = midPoint + (Math.sin(self.sineCount + offset) * midPoint);
            var yPos = sinPos ;

            var rotated = self._rotatePoint({
                'x': xPos ,
                'y': yPos
            }, mid, angle);

            this.css({
                'top': rotated.y,
                'left': rotated.x
            });

            angle += angleInterval;
        });

        self.sineCount += self.options.moveAmount;

    },

    _rotatePoint: function($pPoint, $pOrigin, rot){
        var $rp = [];
        var radians = (rot / 180) * Math.PI;

        $rp['x'] = $pOrigin['x'] + (Math.cos(radians) * ($pPoint['x'] - $pOrigin['x']) - Math.sin(radians) * ($pPoint['y'] - $pOrigin['y']));
        $rp['y'] = $pOrigin['y'] + (Math.sin(radians) * ($pPoint['x'] - $pOrigin['x']) + Math.cos(radians) * ($pPoint['y'] - $pOrigin['y']));

        return $rp;
    }
});