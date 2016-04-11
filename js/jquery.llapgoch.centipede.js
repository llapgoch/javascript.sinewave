jQuery.widget('llapgoch.centipede', {
    options: {
        stageWidth: 800,
        stageHeight: 700,
        minDiameter: 20,
        maxDiameter: 300,
        minDegrees: 1,
        maxDegrees: 300,
        speed: 5,
        arcRenderSpacing: 1,
        drawControlPoints: true,
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
        
        this.currentX = this.options.startPointX;
        this.currentY = this.options.startPointY;

        // for(var i = 0; i < 4; i++){
 //            this._createArc(true);
 //        }
 
        this.getPosition(10000);
        var arcPoint = this.getPointInArc(this.arcs[0], 10);
        this._plotPoint(arcPoint, 4, 'purple');
        
        console.log(this.arcs);
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
        this.ctx.fillRect(point.x - (size / 2), point.y - (size / 2), size, size);
        this.ctx.fill();
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
            throw 'Out of arc bounds';
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
    
    // gets the position on the arcs, creates new if required
    getPosition: function(pos){
        var cumulativeDistance = 0,
            currentArc,
            relativeDistance;
        
        while(pos > this.totalDistance){
            this._createArc(true);
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
    },
    
    _getPositionOnArc: function(pos){
        
    }
});