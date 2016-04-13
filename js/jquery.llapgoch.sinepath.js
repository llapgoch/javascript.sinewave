jQuery.widget('llapgoch.sinepath', {
    options: {
        stageWidth: 800,
        stageHeight: 700,
        minDiameter: 20,
        maxDiameter: 300,
        minDegrees: 1,
        maxDegrees: 180,
        speed: 5,
        arcRenderSpacing: 1,
        drawControlPoints: false,
        startRotation: 0,
        startPoint:{
            x: 100,
            y: 100
        }
    },
    
    canvas: null,
    arcs:null,
    currentArc: {},
    ctx: null,
    currentCos: 0,
    currentSin: 0,
    currentDiameter: 100,
    totalDistance: 0,
    demoPos: 1,
    
    _create: function(){
        var canvas =  $('<canvas />', {
            width: this.options.stageWidth,
            height: this.options.stageHeight
        });
        
        this.element.append(canvas);
        
        this.arcs = [];
        this.canvas = canvas.get(0);
        this.canvas.width = this.options.stageWidth;
        this.canvas.height = this.options.stageHeight;

        this.ctx = this.canvas.getContext('2d');

        var self = this;

        window.setInterval(function(){
            self.demoMove();
        }, 10);
    },

    demoMove: function(){
        var arcPoint = this.getPointForPosition(this.demoPos);

        var r = Math.round(Math.random() * 255);
        var g = Math.round(Math.random() * 255);
        var b = Math.abs(Math.round(Math.random() * 255));
        var color = 'black';
        
        
        this._clearStage();
        //this._drawArcs();
        this._drawArc(this.arcs[this.arcs.length - 1]);
        this._plotRect(arcPoint, 10, 30, color, arcPoint.rotation);
        
        this.demoPos+= 50;

    },

    _clearStage: function(){
        this.ctx.clearRect(0, 0, this.options.stageWidth, this.options.stageHeight);
    },
    
    _degreesToRadians: function(deg){
        return deg * 0.0174533;
    },
    
    _rotatePoint: function($pPoint, $pOrigin, rot){
        var $rp = {};
        var radians = (rot / 180) * Math.PI;

        $rp['x'] = $pOrigin['x'] + (Math.cos(radians) * ($pPoint['x'] - $pOrigin['x']) - Math.sin(radians) * ($pPoint['y'] - $pOrigin['y']));
        $rp['y'] = $pOrigin['y'] + (Math.sin(radians) * ($pPoint['x'] - $pOrigin['x']) + Math.cos(radians) * ($pPoint['y'] - $pOrigin['y']));

        return $rp;
    },
    
    _isOnStage: function(x, y){
        return (x > 0 && x < this.options.stageWidth) &&
                (y > 0 && y < this.options.stageHeight);
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
            this.ctx.rotate(this._degreesToRadians(rotation));
            this.ctx.translate(-point.x, -point.y);
        }
        
        this.ctx.fillStyle = color;        
        this.ctx.fillRect(point.x - (width / 2), point.y - (height / 2), width, height);
        this.ctx.fill();
       
        if(rotation){
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    },
    
    _createArc: function(draw){
        var arc,
            endPoint,
            diameter,
            degreeRange,
            direction,
            numberOfDegrees,
            isOnStage,
            centerPoint,
            currentRotation,
            startPoint,
            circumference,
            distance,
            counter = 0;
        
        if(this.arcs.length){
            var lastArc = this.arcs[this.arcs.length - 1];
           
            currentRotation = lastArc.endRotation;
            startPoint = lastArc.endPoint;
        }else{
            startPoint = this.options.startPoint;
            currentRotation = this.options.startRotation;
        }
        
        do{
            diameter = (Math.random() * (this.options.maxDiameter - this.options.minDiameter)) + this.options.minDiameter;
            direction = Math.random() >= 0.5 ? -1 : 1;
            numberOfDegrees = Math.round((Math.random() * (this.options.maxDegrees - this.options.minDegrees)) + this.options.minDegrees) * direction;
            diameter *= direction;
            
            circumference = (Math.PI * diameter);
            // Distance of the arc to draw
            distance = (circumference / 360) * numberOfDegrees;
            
            centerX = startPoint.x + ((diameter / 2));
            centerY = startPoint.y;
            
            centerPoint = this._rotatePoint(
                {
                    x: centerX,
                    y: centerY
                },
                startPoint,
                currentRotation
            );
            
            arc = {
                distance: distance,
                totalRotation: numberOfDegrees,
                startRotation: currentRotation,
                endRotation: currentRotation + numberOfDegrees,
                startPoint: startPoint,
                centerPoint: centerPoint,
                diameter: diameter,
            };
            
            arc.endPoint = this.getPointInArc(arc, distance);
            
            isOnStage = this._isOnStage(arc.endPoint.x, arc.endPoint.y);
            
            counter++;
            
            // Failed to find a point within bounds
            // Use the last one and keep going
            if(counter > 500){
                console.log("Too many attempts");
                break;
            }
            
        } while(isOnStage == false);
        
        
        this.arcs.push(arc);
        
        if(draw){
            this._drawArc(arc);
        }
        
        // A shorthand of the total distance of the complete shape
        // To avoid having to always calculate via a loop
        this.totalDistance += distance;
    },
    
    getPointInArc: function(arc, position){
        if(position > arc.distance){
            throw 'Out of arc bounds: ' + position + " / " + arc.distance;
        }  
        
        var circumference = (Math.PI * arc.diameter);
        var angleStep = arc.totalRotation / arc.distance;
        var val = position * angleStep;
    
        var rad = this._degreesToRadians(arc.startRotation + val - 180);
        var posY = Math.sin(rad) * (arc.diameter / 2) + arc.centerPoint.y;
        var posX = Math.cos(rad) * (arc.diameter / 2) + arc.centerPoint.x;
        
        return {
            x: posX,
            y: posY
        };
    },
    
    _drawArc: function(arc){
         var steps = arc.distance / this.options.arcRenderSpacing; 
        // Draws a visual representation of the path using this.options.arcRenderSpacing
        if(this.options.drawControlPoints){
            this._plotPoint(arc.centerPoint, 4, 'blue');
        }
    
        for(i = 0; i < steps; i++){
               var arcPoint = this.getPointInArc(arc, i);
               this._plotPoint(arcPoint, 2, 'red');
        }
        
        if(this.options.drawControlPoints){
            var end = this.getPointInArc(arc, arc.distance);
            this._plotPoint(end, 6, 'green');
       }
    },
    
    _drawArcs: function(){
        for(var i = 0; i < this.arcs.length; i++){
            this._drawArc(this.arcs[i]);
        }
    },
    
    // gets the position on the arcs, creates new if required
    getArcForPosition: function(pos){
        var cumulativeDistance = 0,
            currentArc,
            relativeDistance;
        
        while(pos > this.totalDistance){
            this._createArc(false);
        }
        
        // TODO: Adapt this for finding the arc for the requested pos
        for(var i = 0; i < this.arcs.length; i++){
            currentArc = this.arcs[i];
            
            if(cumulativeDistance + currentArc.distance >= pos){
                break;
            }
            
            cumulativeDistance += currentArc.distance;
        }
        
        relativeDistance = pos - cumulativeDistance;

        return {
            arc: currentArc,
            relativePosition: relativeDistance
        };
    },
    
    _getRotationBetweenPoints(point1, point2){
        var dY = point2.y - point1.y;
        var dX = point2.x - point1.x;
        
        return Math.atan(dY / dX) * 180 / Math.PI;
    },
    
    getPointForPosition: function(pos){
        var pastArcData = this.getArcForPosition(pos - 1);
        var arcData = this.getArcForPosition(pos);
        var point = this.getPointInArc(arcData.arc, arcData.relativePosition);
        var rotation = this.options.startRotation;
        
        if(pastArcData.arc){
            var lastPoint = this.getPointInArc(pastArcData.arc, pastArcData.relativePosition);
            rotation = this._getRotationBetweenPoints(lastPoint, point);
        }
       
        point.rotation = rotation; 
        return point;
    }
});