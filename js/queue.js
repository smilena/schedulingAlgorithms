var queue = function() {

    var elements;
    this.enqueue = function(element) {

        if (typeof(elements) === 'undefined') {

            elements = [];   

        }

        elements.push(element);                       

    }

    this.dequeue = function() {

        return elements.shift();                                                

    }

    this.peek = function(){

        return elements[0];                  

    }

    this.pop= function(){
        elements.splice(0,1);
    }

}