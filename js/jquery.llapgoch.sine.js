jQuery.widget('llapgoch.sinewave', {
    options:{
        circleDiameter: 4,
        stageSize: 400,
        containerCircleClass: 'containerCircle',
        circleClass: 'circle',
        amount: 50,
        updateInterval: 5,
        moveAmount: 0.004,
        angleOffset: 0,
        circleDivisor: 1,
        circleColor: 'red',
        numberOfTrails: 1,
        blur: 5,

        updateMethod: function(a, angleInterval){
            return Math.sin((angleInterval * (Math.PI / 180))) * a;
        },

        trailsUpdateMethod: function(point, i){
            var dist = ((this.options.numberOfTrails - i) / this.options.numberOfTrails);
            point.alpha = dist;
            point.color = this.options.circleColor;
            point.diameter = this.options.circleDiameter * dist;

            return point;
        }
    },

    containerCircles: null,
    updateId: null,
    sineCount: 0,
    points: null,
    mainOffset: 0,
    startAngle: 0,
    initComplete: false,
    canvas: null,
    ctx: null,

    _create: function(){
        // Create the canvas
        var canvas =  $('<canvas />', {
            width: this.options.stageSize,
            height: this.options.stageSize
        });

        if(this.options.blur) {
            var blur = 'blur(' + this.options.blur + 'px)';

            canvas.css({
                'filter': blur,
                '-webkit-filter': blur,
                '-moz-filter': blur,
                '-o-filter': blur,
                '-ms-filter': blur
            });
        }

        this.points = [];
        this.canvas = canvas.get(0);

        this.canvas.width = this.options.stageSize;
        this.canvas.height = this.options.stageSize;

        this.element.append(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this._addEvents();
        this.enable();
    },

    _addEvents: function(){
        this._on(this.element, {
            "click .stop": function(ev){
                ev.preventDefault();
                this.disable();
            },
            "click .start": function(ev){
                ev.preventDefault();
                this.enable();
            }
        });
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
            this.updateId = null;
        }
    },

    _setOption: function(key, value){
        this._superApply(arguments);
        this._refresh();
    },

    _distanceBetweenPoints: function(point1, point2){
        var xOffset = point1.x - point2.x;
        var yOffset = point1.y - point2.y;

        return Math.sqrt((xOffset * yOffset) + (yOffset * yOffset));
    },

    _update: function(){
        var self = this;
        var cRadius = this.options.circleDiameter / 2;
        var midPoint = (this.options.stageSize / 2) - cRadius;
        var xPos = (self.options.stageSize / 2) - cRadius;

        var angleInterval = 360 / this.options.amount / this.options.circleDivisor;
        var angle = this.startAngle;

        var mid = {
            x: midPoint,
            y: midPoint
        };

        var zero = {
            x: 0,
            y: 0
        };


        this.ctx.clearRect(0, 0, this.options.stageSize, this.options.stageSize);

        for(var i = 0; i <= this.options.amount; i++){

            var offset = self.options.updateMethod(i + 1, angleInterval);

            offset = isNaN(offset) ? 0 : offset;

            var sinPos = midPoint + (Math.sin(self.sineCount + offset) * midPoint),
                yPos = sinPos;

            var rotated = self._rotatePoint({
                'x': xPos ,
                'y': yPos
            }, mid, angle);


            rotated.diameter = this.options.circleDiameter;
            rotated.color = this.options.circleColor;

            if(!this.points[i]) {
                this.points[i] = [];
            }

            // Add the point to the trails array
            this._updatePoints(this.points[i], rotated);

            angle += angleInterval;
            //break;
        }

        self.sineCount += self.options.moveAmount;
        self.startAngle += self.options.angleOffset;

        if(!this.initComplete){
            this._stop();
            this.initComplete = true;
        }
    },

    _drawPoint: function(options){

        this.ctx.fillStyle = options.color;

        this.ctx.beginPath();
        this.ctx.globalAlpha = options.alpha;
        this.ctx.arc(options.x, options.y, options.diameter, 0, 2 * Math.PI, false);
        this.ctx.fill();
    },

    _updatePoints: function(points, newPoint){
        if(points.length >= this.options.numberOfTrails){
            points.splice(this.options.numberOfTrails - 1, points.length - (this.options.numberOfTrails) + 1);
        }

        if(newPoint) {
            points.splice(0, 0, newPoint);
        }

        for(var i = 0; i < points.length; i++){
            var values = this.options.trailsUpdateMethod.apply(this, [points[i], i]);
            this._drawPoint(values);
        }
    },

    _rotatePoint: function($pPoint, $pOrigin, rot){
        var $rp = [];
        var radians = (rot / 180) * Math.PI;

        $rp['x'] = $pOrigin['x'] + (Math.cos(radians) * ($pPoint['x'] - $pOrigin['x']) - Math.sin(radians) * ($pPoint['y'] - $pOrigin['y']));
        $rp['y'] = $pOrigin['y'] + (Math.sin(radians) * ($pPoint['x'] - $pOrigin['x']) + Math.cos(radians) * ($pPoint['y'] - $pOrigin['y']));

        return $rp;
    }
});