var queue = function() {

    var elements;
    this.add = function(element) {
        if (typeof(elements) === 'undefined') {
            elements = [];   
        }
        elements.push(element);                       
    };

    this.shift = function() {    	
        return elements.shift();                                                	
    };

    this.firstElement = function(){
        return elements[0];                  
    };

    this.length= function(){
        return elements.length;
    };

    this.getElement = function(index){
    	return elements[index];
    };

    this.replace=function(indexPrev, element){
    	elements[indexPrev]=element;
    };

    this.setQuantum = function(element, newQuantum){
    	var indexElemento = elements.indexOf(element);
    	elements[indexElemento].quantum=newQuantum;
    };

    this.allElements = function(){
    	return elements;
    };

    this.setNewTime = function(element, time){
    	var indexElemento = elements.indexOf(element);
    	elements[indexElemento].tiempo-=time;
    }
};

var numeroProcesos;
var espera=new queue;
var bloqueado=new queue;
var listo=new queue;
var ejecucion=new queue;
var suspendido=new queue;
var recursos = [0,0,0,0]; //el uso de recursos inicia en 0
var colores=[];
var gantt=[];
var tiempos=[];
var tiemposLlegada=[];
var tiempoBloqueo=0;
var tiempoSuspendido=0;

$("#desbloquear").bind("click",function(){
	$("#P" + bloqueado.firstElement().id).appendTo($("#espera"));
	espera.add(bloqueado.firstElement());
	bloqueado.shift();
});

$("#generarGantt").bind("click",function(){
	$("#RR").hide("slow");
	$(".hide").show("slow");
});

$("#regresar").bind("click",function(){
	$("#RR").show("slow");
	$(".hide").hide("slow");
});

$("#generarTabla").bind("click", function(){
	numeroProcesos= Math.floor((Math.random()*15)+1);
	$("#datos tbody").css("height","0");
	generarTiemposLlegada();
	for(var i = 1;i<=numeroProcesos;i++){
		var colorTemp=generarColor();
		var tiempoTemp=Math.floor((Math.random()*24)+4);
		$("#datos tbody").append("<tr><td style='color:"+colorTemp+";'>"+i+"</td><td><span>"+tiempoTemp+"</span></td><td>"+tiemposLlegada[i-1]+"</td></tr>");
		colores.push(colorTemp);
		tiempos.push(tiempoTemp);
	}

});

function replaceAt(s, n, t) {
    return s.substring(0, n) + t + s.substring(n + 1);
}

var crearProcesos = function  (){
	for(var i=1;i<=numeroProcesos;i++){
		var temp = {
			id:i,
			tiempo:tiempos[i-1],
			usoRam:usoRecurso(),
			usoTeclado:usoRecurso(),
			usoMonitor:usoRecurso(),
			usoVideo:usoRecurso(),
			color:colores[i-1],
			tiempoLlegada:tiemposLlegada[i-1],
			bloqueo:false,
			quantum:0		
		};
		espera.add(temp);
	}
	ordenarProcesos();	
};

var analisisProcesos = function() {
	
		if($("#ejecucion div").length == 0 && $("#espera div").length == 0 && $("#bloqueado div").length == 0 && $("#suspendido div").length == 0) {window.clearInterval(procesamiento)};	
		if ($("#ejecucion div").length > 0) {
			if (esperaProceso == ejecucion.firstElement().quantum) {							 				 	
			 	if (ejecucion.firstElement().tiempo > ejecucion.firstElement().quantum){
					if(bloqueo() && !ejecucion.firstElement().bloqueo){
						ejecucion.firstElement().bloqueo=true;
						mensajeBloqueo();
						bloqueado.add(ejecucion.firstElement());
						$("#P" + ejecucion.firstElement().id).appendTo("#bloqueado");
						tiempoBloqueo=0;
					}else{
						
						$("#P" + ejecucion.firstElement().id).appendTo("#suspendido");
						ejecucion.setNewTime(ejecucion.firstElement(),esperaProceso);
						ejecucion.setQuantum(ejecucion.firstElement(),generarQuantum(ejecucion.firstElement().tiempo));
						suspendido.add(ejecucion.firstElement());		
						$("#P"+ejecucion.firstElement().id).find("span.pequeno").html("Id "+ejecucion.firstElement().id+" T "+ejecucion.firstElement().tiempo+" Q "+generarQuantumSuspendido(ejecucion.firstElement().tiempo)+" TL "+ejecucion.firstElement().tiempoLlegada);											
					}	
					ejecucion.shift();
					esperaProceso = 1;				
			    }
			    else{
					$("#P" + ejecucion.firstElement().id).appendTo("#listo");
					listo.add(ejecucion.firstElement());
					ejecucion.shift();
					esperaProceso = 1;
			    }				
			}else{
				esperaProceso++;
			
			}

		}else if($("#espera div").length > 0){
			$("#P" + espera.firstElement().id).appendTo($("#ejecucion"));
			ejecucion.add(espera.firstElement());
			actualizarRecursos(ejecucion.firstElement());
		  	espera.shift();	  	
		}
		if($("#bloqueado div").length>0){
			if(tiempoBloqueo<7 && bloqueado.length()>0){
			tiempoBloqueo++;
			}else if(tiempoBloqueo==7){
				$("#P" + bloqueado.firstElement().id).appendTo($("#espera"));
				espera.add(bloqueado.firstElement());
				bloqueado.shift();
				tiempoBloqueo=0;
			}
		}
		if($("#suspendido div").length>0){	
			if(tiempoSuspendido<generarQuantumSuspendido(suspendido.firstElement().tiempo) && suspendido.length()>0){
				tiempoSuspendido++;
			}else if(tiempoSuspendido==generarQuantumSuspendido(suspendido.firstElement().tiempo)){

				$("#P" + suspendido.firstElement().id).appendTo($("#espera"));
				console.log("quantum "+suspendido.firstElement().quantum);
				$("#P"+suspendido.firstElement().id).find("span.pequeno").html("Id "+suspendido.firstElement().id+" T "+suspendido.firstElement().tiempo+" Q "+suspendido.firstElement().quantum+" TL "+suspendido.firstElement().tiempoLlegada);											
				espera.add(suspendido.firstElement());
				suspendido.shift();
				tiempoSuspendido=0;
			}
		}
};

var iniciarSimulacion = function () {
	window.esperaProceso=1;
    window.procesamiento = window.setInterval(analisisProcesos, 1700);	
};

var ordenarProcesos = function(){
	for(var i=0;i<numeroProcesos-1;i++){
		for(var j=i+1;j<numeroProcesos;j++){
			if(espera.getElement(i).tiempoLlegada>espera.getElement(j).tiempoLlegada){
				var temp=espera.getElement(i);
				espera.replace(i,espera.getElement(j));
				espera.replace(j,temp);
			}
		}
	}
	
};

var generarQuantumSuspendido = function(tiempoEjecucion){
	return Math.floor(tiempoEjecucion*(1/2)+3);
};

$("#simular").bind("click",function(){
	
	//crear procesos
	crearProcesos();
	inicializarGantt();
	generarDiagramaGantt();
	crearProcesos();
	
	for(var index=0;index<espera.length();index++){
		
		espera.setQuantum(espera.getElement(index),generarQuantum(espera.getElement(index).tiempo));
			
		$("#espera").append("<div class='span12' id='P"+espera.getElement(index).id+"' style='height:20px; background-color:"+espera.getElement(index).color+"; float:left; text-align:center;'><span class='pequeno'>Id "+espera.getElement(index).id+" T "+espera.getElement(index).tiempo+" Q "+espera.getElement(index).quantum+" TL "+espera.getElement(index).tiempoLlegada+"</span></div>");		
	}
	
	iniciarSimulacion();
});

var generarTiemposLlegada = function(){
	var temp = Math.floor((Math.random()*numeroProcesos)+1);
	if(tiemposLlegada.length<numeroProcesos){
		if(tiemposLlegada.indexOf(temp)==-1){
			tiemposLlegada.push(temp);
		}
		generarTiemposLlegada();
	}
};

function usoRecurso(){
	return porcentaje = Math.floor((Math.random()*100)+1);
}

function generarColor(){
	var letras = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letras[Math.round(Math.random() * 15)];
    }
    return color; 
}

function generarQuantum(tiempoEjecucion){
	return Math.floor(tiempoEjecucion*(2/3)+1);
}

function bloqueo(){
	var num = Math.floor((Math.random()*10)+1);
	if(num <= 3){
		return true; //bloqueadooo
 	}else{
 		return false; //no bloqueado
	}
}

function actualizarRecursos(procesoActual){
	for(var i=0;i<recursos.length;i++){
		recursos[i]=0;
	}
	recursos[0]+=procesoActual.usoRam;
	recursos[1]+=procesoActual.usoTeclado;
	recursos[2]+=procesoActual.usoMonitor;
	recursos[3]+=procesoActual.usoVideo;

	$("#ram").animate({width:recursos[0]+"px"},1000,function(){
		$("#porcentajeRecurso1").html(recursos[0]);
	});
	$("#teclado").animate({width:recursos[1]+"px"},1000,function(){
		$("#porcentajeRecurso2").html(recursos[1]);
	});
	$("#monitor").animate({width:recursos[2]+"px"},1000,function(){
		$("#porcentajeRecurso3").html(recursos[2]);
	});
	$("#video").animate({width:recursos[3]+"px"},1000,function(){
		$("#porcentajeRecurso4").html(recursos[3]);
	});
}

var generarDiagramaGantt = function(){

	if(espera.length()>0){
		var proceso=espera.firstElement();
		var quantum=generarQuantum(espera.firstElement().tiempo);
		if(proceso.tiempo>=quantum){			
			for(var i=0;i<quantum;i++){
				var id=proceso.id-1;
				gantt[id]+="X";	
				llenarEspera(id);			
			}
			proceso.tiempo-=quantum;
			espera.add(proceso);
			espera.shift();
		}else if(proceso.tiempo==0){
			espera.shift();	
		}
		generarDiagramaGantt();
	}else{
		limpiarGantt();
		imprimirDiagramaGantt();
	}
};

var limpiarGantt = function(){
	for(var i=0;i<gantt.length;i++){
		for(var j=gantt[i].length-1;j>=0;j--){
			if(gantt[i].charAt(j)=="E"){
				gantt[i]=replaceAt(gantt[i],j," ");			
				
			}else{
				break;
			}
		}
	}

	for(var i=0;i<gantt.length;i++){
		for(var j=0;j<gantt[i].length;j++){
			if(j<tiemposLlegada[i] && gantt[i].charAt(j)=="E"){
				gantt[i]=replaceAt(gantt[i],j," ");			
				
			}else{
				break;
			}
		}
	}
};

var inicializarGantt=function(){
	for(var i =0;i<numeroProcesos;i++){
		gantt.push("");
	}
};

var llenarEspera = function(fila){
	for(var i=0;i<numeroProcesos;i++){
		if(i!=fila){
			gantt[i]+="E";
		}
	}
};

var llenarListo = function(fila){
	for(var i=0;i<numeroProcesos;i++){
		if(i!=fila){
			gantt[i]+=" ";
		}
	}
};

var imprimirDiagramaGantt=function(){	
	for(var i=0;i<gantt.length;i++){
		var linea = "";
		for(var j=0;j<gantt[i].length;j++){
			linea+="<td>"+gantt[i][j]+"</td>";
		}
		$("#gantt tbody").append("<tr><td>P"+(i+1)+"</td>"+linea+"</tr>");
	}	
};

var mensajeBloqueo = function(){
	var temp = Math.floor((Math.random()*4)+1);
	switch (temp)
	{
		case 1:
			alert("Fallo Recurso: Memoria RAM");
			break;
		case 2:
			alert("Fallo Recurso: Teclado");
			break;
		case 3:
			alert("Fallo Recurso: Impresora");
			break;
		case 4:
			alert("Fallo recurso: Tarjeta de video");
			break;
		default:
			break;
	}
};

