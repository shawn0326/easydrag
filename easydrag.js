/**
* easydrag
* 
*/
(function($){

    // to track if the mouse button is pressed
    var isTouching = false;

    // to track the current element being dragged
    var currentElement = null;

    // callback holders
    var dropCallbacks = {};
    var dragCallbacks = {};

    // global position records
    var lastMouseX;
    var lastMouseY;
    var lastElemTop;
    var lastElemLeft;

    // track element dragStatus
    var dragStatus = {};

    // if user is holding any handle or not
    var holdingHandler = false;

    // returns the mouse (cursor) current position
    $.getMousePosition = function(e){
        var posx = 0;
        var posy = 0;

        if(e.touches[0] != undefined){
            posx = e.touches[0].pageX;
            posy = e.touches[0].pageY;
        } else if(e.changedTouches[0] != undefined) {
            posx = e.changedTouches[0].pageX;
            posy = e.changedTouches[0].pageY;
        }
        

        return { 'x': posx, 'y': posy };
    };

    // updates the position of the current element being dragged
    $.updatePosition = function(e) {
        var pos = $.getMousePosition(e);

        var spanX = (pos.x - lastMouseX);
        var spanY = (pos.y - lastMouseY);

        
        console.log(lastElemLeft + spanX)
        console.log(lastElemTop + spanY)

        $(currentElement).css("top", (lastElemTop + spanY)+'px');
        $(currentElement).css("left", (lastElemLeft + spanX)+'px');
    };

    // when the mouse is moved while the mouse button is pressed
    $(document).on('touchmove',function(e){
        if(isTouching && dragStatus[currentElement.cd]){
            // update the position
            $.updatePosition(e);

            return false
        }
    });

    // when the mouse button is released
    $(document).on('touchend',function(e){
        if(isTouching && dragStatus[currentElement.cd]){
            isTouching = false;
            // update the position and call the registered function
            $.updatePosition(e);
            dropCallbacks[currentElement.cd](e, currentElement);
            $(currentElement).css("z-index",currentElement.index);
            return false;
        }
    });

    // register the function to be called while an element is being dragged
    $.fn.ondrag = function(callback){
        if(this.attr('dragID')){
            dragCallbacks[this.attr('dragID')] = callback;
        }
        return this; 
    };

    // register the function to be called when an element is dropped
    $.fn.ondrop = function(callback){
        if(this.attr('dragID')){
            dropCallbacks[this.attr('dragID')] = callback;
        }

        return this;   
    };

    // disable the dragging feature for the element
    $.fn.dragOff = function(){
        if(this.attr('dragID')){
            dragStatus[this.attr('dragID')] = false;
        }

        return this;
    };

    // enable the dragging feature for the element
    $.fn.dragOn = function(){
        if(this.attr('dragID')){
            dragStatus[this.attr('dragID')] = true;
        }

        return this;
    };

    // set an element as draggable - allowBubbling enables/disables event bubbling
    $.fn.easydrag = function(selector, dragCallback, dropCallback){
        // set dragClass
        this.attr('dragID',"dc_"+(new Date().getTime()));

        //set callback
        if(dragCallback){
            dragCallbacks[this.attr('dragID')] = dragCallback;
        }
        if(dropCallback){
            dropCallbacks[this.attr('dragID')] = dropCallback;
        }

        //set statue
        dragStatus[this.attr('dragID')] = "on";

        // when an element receives a mouse press
        this.on('touchstart',selector,function(e){
            // if firstdrag
            if(!$(this).attr('dragClass')){
                // get dragClass
                var classDom = $(this).closest('*[dragID]');
                if (classDom.length != 0){
                    $(this).attr('dragClass',classDom.attr('dragID'));
                }
            }

            // just when "on" 
            if ( !dragStatus[$(this).attr('dragClass')] )
                return false;

            // currentElement
            currentElement = this;
            currentElement.cd = $(currentElement).attr('dragClass');

            // set it as absolute positioned
            $(this).css("position", "absolute");

            // set z-index
            currentElement.index = $(this).css("z-index");
            $(this).css("z-index", parseInt( new Date().getTime()/1000 ));

            // update track variables
            isTouching = true;
            
            // retrieve positioning properties
            var pos = $.getMousePosition(e);
            lastMouseX = pos.x;
            lastMouseY = pos.y;

            lastElemTop = this.offsetTop;
            lastElemLeft = this.offsetLeft;

            // update the position and call the registered function
            $.updatePosition(e);
            dragCallbacks[currentElement.cd](e, currentElement);
        });

        return this;
    };

})($);
