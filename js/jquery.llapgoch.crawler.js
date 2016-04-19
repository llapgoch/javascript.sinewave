jQuery.widget('llapgoch.crawler', {
    options: {
        // The object to use in getting the points within the path
        pathDefiner:['llapgoch', 'sinepath'],
        updateInterval: 10,
        arcRenderSpacing: 1,
        drawControlPoints: false,
        
        pathSettings: {
            stageWidth: 500,
            stageHeight: 500
        }
    },
    
    pather: null,
    updateInt: null,
    ctx: null,
    demoPos: 1,
    
    _create: function(){
        this.pather = new $[this.options.pathDefiner[0]][this.options.pathDefiner[1]](this.options.pathSettings);
        
        var canvas =  $('<canvas />', {
            width: this.options.pathSettings.stageWidth,
            height: this.options.pathSettings.stageHeight
        });
        
        this.canvas = canvas.get(0);
        this.canvas.width = this.options.pathSettings.stageWidth;
        this.canvas.height = this.options.pathSettings.stageHeight;

        this.ctx = this.canvas.getContext('2d');
        
        this.element.append(canvas);
        
        this._start();
    },
    
    enable: function(){
        this._start();
    },
    
    disable: function(){
        this._stop();
    },
    
    _start: function(){
        var self = this;
        
        this._stop();
        
        this.updateInt = window.setInterval(function(){
            self.move();
        }, this.options.updateInterval);
    },
    
    _stop: function(){
        if(this.updateInt){
            window.clearInterval(this.updateInt);
        }
    },
    
    move: function(){
        var arcPoint, r, g, b, color,
            segments = 200,
            segmentWidth = 10,
            segmentHeight = 20;
            overlap = 5;

        this._clearStage();

        for(var i = 0; i < segments; i++){
            arcPoint = this.pather.getPointForPosition(this.demoPos + (i * (segmentWidth - overlap)));

            r = Math.round(Math.random() * 255);
            g = Math.round(Math.random() * 255);
            b = Math.abs(Math.round(Math.random() * 255));
            color = 'black';

            //this._drawArcs();
            this._plotRect(arcPoint, segmentWidth, segmentHeight, color, arcPoint.rotation);

        }

        this._drawArc(this.pather.getLastArc());
        this.demoPos+= 2;
    },
    
    _plotPoint: function(point, size, color){
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(point.x - (size / 2), point.y - (size / 2), size, 0, 2 * Math.PI, false);
        this.ctx.fill();
    },

    _plotRect: function(point, width, height, color, rotation){
        if(rotation){
            this.ctx.translate(point.x, point.y);
            this.ctx.rotate(this.pather.degreesToRadians(rotation));
            this.ctx.translate(-point.x, -point.y);
        }

        this.ctx.fillStyle = color;
        this.ctx.fillRect(point.x - (width / 2), point.y - (height / 2), width, height);
        this.ctx.fill();

        if(rotation){
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    },

    _clearStage: function(){
        this.ctx.clearRect(0, 0, this.options.pathSettings.stageWidth, this.options.pathSettings.stageHeight);
    },
    
    _drawArc: function(arc){
         var steps = arc.distance / this.options.arcRenderSpacing;
        // Draws a visual representation of the path using this.options.arcRenderSpacing
        if(this.options.drawControlPoints){
            this._plotPoint(arc.centerPoint, 4, 'blue');
        }

        for(i = 0; i < steps; i++){
               var arcPoint = this.pather.getPointInArc(arc, i);
               this._plotPoint(arcPoint, 2, 'red');
        }

        if(this.options.drawControlPoints){
            var end = this.pather.getPointInArc(arc, arc.distance);
            this._plotPoint(end, 6, 'green');
       }
    },

    _drawArcs: function(){
        for(var i = 0; i < this.pather.getArcs().length; i++){
            this._drawArc(this.pather.getArc(i));
        }
    },
    
});