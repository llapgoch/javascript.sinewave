jQuery.widget('llapgoch.sinepath', {
    options: {
        stageWidth: 800,
        stageHeight: 700,
        minDiameter: 30,
        maxDiameter: 500,
        minDegrees: 10,
        maxDegrees: 200,
        speed: 10,
        startRotation: 0,
        startPoint:{
            x: 100,
            y: 100
        }
        
    },
    
    canvas: null,
    arcs:null,
    currentArc: {},
    
    totalDistance: 0,
    defaultElement: null,
    
    _create: function(){
        this.arcs = [];
    },
    
    degreesToRadians: function(deg){
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
    
    getArcs: function(){
        return this.arcs;
    },
    
    getArc: function(i){
        return this.arcs[i];
    },
    
    getLastArc: function(){
        if(this.arcs.length){
            return this.arcs[this.arcs.length - 1];
        }
    },
    
    getPointInArc: function(arc, position){
        if(position > arc.distance){
            throw 'Out of arc bounds: ' + position + " / " + arc.distance;
        }  
        
        var circumference = (Math.PI * arc.diameter);
        var angleStep = arc.totalRotation / arc.distance;
        var val = position * angleStep;
    
        var rad = this.degreesToRadians(arc.startRotation + val - 180);
        var posY = Math.sin(rad) * (arc.diameter / 2) + arc.centerPoint.y;
        var posX = Math.cos(rad) * (arc.diameter / 2) + arc.centerPoint.x;
        
        return {
            x: posX,
            y: posY
        };
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
    
    // Returns rotation in degrees
    _getRotationBetweenPoints: function(point1, point2){
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