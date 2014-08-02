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
    	if(elements!='undefined'){
    		return elements.length;
    	}else{
    		return [];
    	} 
    };

    this.getElement = function(index){
    	if(elements!='undefined'){
    		return elements[index];
    	}else{
    		return [];
    	}
    	
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
    };

    this.borrarElemento = function(element){
    	elements.splice(elements.indexOf(element),1);	
    };

    this.setEnvejecimiento = function(){
    	elements[0].envejecimiento+=1;
    };

    this.clearEnvejecimiento = function(){
    	elements[0].envejecimiento=0;
    };

    this.setPrioridad = function(elemento,nvaPrioridad){
    	elements[elements.indexOf(elemento)].prioridad=nvaPrioridad;
    }
};


var numeroProcesos;
//var espera=[]; //LISTO
var sistema=new queue(); //LISTO...era espera
var interactivos=new queue(); //LISTO...era espera
var usuario=new queue(); //LISTO...era espera
var bloqueado=new queue();
var finalizado=new queue(); //FINALIZADO....era listo
var ejecucion=new queue();
var suspendido=new queue();
var recursos = [0,0,0,0]; //el uso de recursos inicia en 0
var colores=[];
var tiempos=[];
var tiemposLlegada=[];
var tiempoBloqueo=0;
var tiempoSuspendido=0;
var contadorGlobal=0;
var tiempoUsuario=5;//tiempo maximo en procesos de usuario
var tiempoInteractivos=5;//tiempo maximo en procesos interactivos
var tiempoSistema=5;//tiempo maximo en procesos de sistem
var prioridades=[];
var topeEnvejecimiento=20;

$("#desbloquear").bind("click",function(){
	if(bloqueado.firstElement().prioridad==1){
		$("#P" + bloqueado.firstElement().id).appendTo($("#sistema"));
		sistema.add(bloqueado.firstElement());
	}else if(bloqueado.firstElement().prioridad==2){
		$("#P" + bloqueado.firstElement().id).appendTo($("#interactivos"));
		interactivos.add(bloqueado.firstElement());
	}else if(bloqueado.firstElement().prioridad==3){
		$("#P" + bloqueado.firstElement().id).appendTo($("#usuario"));
		usuario.add(bloqueado.firstElement());
	}

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
	generarTiempos();
	generarPrioridades();
	console.log(tiemposLlegada);
	console.log(tiempos);
	for(var i = 1;i<=numeroProcesos;i++){
		var colorTemp=generarColor();
		$("#datos tbody").append("<tr><td style='color:"+colorTemp+";'>"+i+"</td><td><span>"+tiempos[i-1]+"</span></td><td>"+tiemposLlegada[i-1]+"</td><td>"+prioridades[i-1]+"</td></tr>");
		colores.push(colorTemp);
	}

});

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
			bloqueado:false,
			quantum:0,
			prioridad:prioridades[i-1],
			gantt:"",
			envejecimiento:0		
		};
		clasificar(temp);	
	}
	ordenarProcesos(usuario);	
};

$("#simular").bind("click",function(){
	crearProcesos();	
	for(var index=0;index<sistema.length() && sistema != "undefined";index++){		
		sistema.setQuantum(sistema.getElement(index),generarQuantum(sistema.getElement(index).tiempo));			
		$("#sistema").append("<div class='span12' id='P"+sistema.getElement(index).id+"' style='display:block; width:136px; height:20px; background-color:"+sistema.getElement(index).color+"; float:left; text-align:center;'><span class='pequeno'>Id "+sistema.getElement(index).id+" T "+sistema.getElement(index).tiempo+" Q "+sistema.getElement(index).quantum+" TL "+sistema.getElement(index).tiempoLlegada+"</span></div>");		
	}	

	for(var index=0;index<interactivos.length() && interactivos != "undefined";index++){
		$("#interactivos").append("<div class='span12' id='P"+interactivos.getElement(index).id+"' style='display:block; width:136px; height:20px; background-color:"+interactivos.getElement(index).color+"; float:left; text-align:center;'><span class='pequeno'>Id "+interactivos.getElement(index).id+" T "+interactivos.getElement(index).tiempo+" TL "+interactivos.getElement(index).tiempoLlegada+"</span></div>");
	}

	for(var index=0;index<usuario.length() && usuario != "undefined";index++){
		$("#usuario").append("<div class='span12' id='P"+usuario.getElement(index).id+"' style='display:block; width:136px; height:20px; background-color:"+usuario.getElement(index).color+"; float:left; text-align:center;'><span class='pequeno'>Id "+usuario.getElement(index).id+" T "+usuario.getElement(index).tiempo+" TL "+usuario.getElement(index).tiempoLlegada+"</span></div>");
	}
	iniciarSimulacion();
});

var iniciarSimulacion = function () {
	window.esperaProceso=1;
    window.procesamiento = window.setInterval(analisisProcesos, 1700);	
};

var analisisProcesos =function(){
	if($("#ejecucion div").length == 0 && $("#sistema div").length == 0 && $("#interactivos div").length == 0 && $("#usuario div").length == 0 && $("#bloqueado div").length == 0 && $("#suspendido div").length == 0) {window.clearInterval(procesamiento)};	
	if($("#ejecucion div").length > 0){
		if(ejecucion.firstElement().prioridad==1){
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
					$("#P" + ejecucion.firstElement().id).appendTo("#finalizado");
					finalizado.add(ejecucion.firstElement());
					ejecucion.shift();
					esperaProceso = 1;
			    }				
			}else{
				esperaProceso++;			
			}
		}else if(ejecucion.firstElement().prioridad==2){
			if(ejecucion.firstElement().tiempo==1){
				if(bloqueo() && !ejecucion.firstElement().bloqueado){
					mensajeBloqueo();
					ejecucion.setNewTime(ejecucion.firstElement(),1);
					bloqueado.add(ejecucion.firstElement());
					$("#P" + ejecucion.firstElement().id).appendTo("#bloqueado");
					$("#P"+ejecucion.firstElement().id).find("span.pequeno").html("Id "+ejecucion.firstElement().id+" T "+ejecucion.firstElement().tiempo+" TL "+ejecucion.firstElement().tiempoLlegada);
					ejecucion.firstElement().bloqueado=true;
					tiempoBloqueo=0;
				}else{
		    		$("#P" + ejecucion.firstElement().id).appendTo("#finalizado");
		    		$("#P"+ejecucion.firstElement().id).find("span.pequeno").html("Id "+ejecucion.firstElement().id+" T 0 TL "+ejecucion.firstElement().tiempoLlegada);
					finalizado.add(ejecucion.firstElement());
		    	}

		    	ejecucion.shift();
			}else{
				ejecucion.setNewTime(ejecucion.firstElement(),1);
				var temp=comparar(ejecucion.firstElement());							
				interactivos.add(ejecucion.firstElement());
				$("#P"+ejecucion.firstElement().id).find("span.pequeno").html("Id "+ejecucion.firstElement().id+" T "+ejecucion.firstElement().tiempo+" TL "+ejecucion.firstElement().tiempoLlegada);
				$("#P" + ejecucion.firstElement().id).appendTo($("#interactivos"));
				ejecucion.add(temp);
				$("#P" + temp["id"]).appendTo($("#ejecucion"));
				ejecucion.shift();
				interactivos.borrarElemento(ejecucion.firstElement());					
								
			}
		}else if(ejecucion.firstElement().prioridad==3){
			if(ejecucion.firstElement().tiempo==1){
				if(bloqueo() && !ejecucion.firstElement().bloqueo){
					ejecucion.firstElement().bloqueo=true;
					mensajeBloqueo();
					bloqueado.add(ejecucion.firstElement());
					$("#P" + ejecucion.firstElement().id).appendTo("#bloqueado");
					tiempoBloqueo=0;
				}else{	
					$("#P" + ejecucion.firstElement().id).appendTo("#finalizado");
		    		$("#P"+ejecucion.firstElement().id).find("span.pequeno").html("Id "+ejecucion.firstElement().id+" T 0 TL "+ejecucion.firstElement().tiempoLlegada);
					finalizado.add(ejecucion.firstElement());											
				}	
				ejecucion.shift();
				esperaProceso = 1;
			}else{
				ejecucion.setNewTime(ejecucion.firstElement(),1);
			}
		}
		contadorGlobal++;
		console.log(contadorGlobal);
		if(interactivos.length()>0){
			interactivos.setEnvejecimiento();
		}
		if(usuario.length()>0){
			usuario.setEnvejecimiento();
		}		
				
	}else if(sistema.length()>0){
		$("#P" + sistema.firstElement().id).appendTo($("#ejecucion"));
		ejecucion.add(sistema.firstElement());
		actualizarRecursos(ejecucion.firstElement());
	  	sistema.shift();	
	}else if(interactivos.length()>0){
		var temp=comparar(interactivos.firstElement());
		ejecucion.add(temp);
		$("#P" + temp["id"]).appendTo($("#ejecucion"));
		interactivos.borrarElemento(ejecucion.firstElement());	
	}else if(usuario.length()>0){
		ordenarProcesos(usuario);
		ejecucion.add(usuario.firstElement());
		$("#P" + usuario.firstElement().id).appendTo($("#ejecucion"));
		usuario.borrarElemento(ejecucion.firstElement());
	}
	if($("#bloqueado div").length>0){
		if(tiempoBloqueo<4 && bloqueado.length()>0){
			tiempoBloqueo++;
		}else if(tiempoBloqueo==4){
			if(bloqueado.firstElement().prioridad==1){
				$("#P" + bloqueado.firstElement().id).appendTo($("#sistema"));
				sistema.add(bloqueado.firstElement());
			}else if(bloqueado.firstElement().prioridad==2){
				$("#P" + bloqueado.firstElement().id).appendTo($("#interactivos"));
				interactivos.add(bloqueado.firstElement());
			}else if(bloqueado.firstElement().prioridad==3){
				$("#P" + bloqueado.firstElement().id).appendTo($("#usuario"));
				usuario.add(bloqueado.firstElement());
			}
			
			bloqueado.shift();
			tiempoBloqueo=0;
		}
	}
	if($("#suspendido div").length>0){	
		if(tiempoSuspendido<4 && suspendido.length()>0){
			tiempoSuspendido++;
		}else if(tiempoSuspendido==4){
			if(suspendido.firstElement().prioridad==1){
				$("#P" + suspendido.firstElement().id).appendTo($("#sistema"));
				$("#P"+suspendido.firstElement().id).find("span.pequeno").html("Id "+suspendido.firstElement().id+" T "+suspendido.firstElement().tiempo+" Q "+suspendido.firstElement().quantum+" TL "+suspendido.firstElement().tiempoLlegada);											
				sistema.add(suspendido.firstElement());
			}else if(suspendido.firstElement().prioridad==2){
				$("#P" + suspendido.firstElement().id).appendTo($("#interactivos"));
				$("#P"+suspendido.firstElement().id).find("span.pequeno").html("Id "+suspendido.firstElement().id+" T "+suspendido.firstElement().tiempo+" Q "+suspendido.firstElement().quantum+" TL "+suspendido.firstElement().tiempoLlegada);											
				interactivos.add(suspendido.firstElement());
			}else if(suspendido.firstElement().prioridad==3){
				$("#P" + suspendido.firstElement().id).appendTo($("#usuario"));
				$("#P"+suspendido.firstElement().id).find("span.pequeno").html("Id "+suspendido.firstElement().id+" T "+suspendido.firstElement().tiempo+" Q "+suspendido.firstElement().quantum+" TL "+suspendido.firstElement().tiempoLlegada);											
				usuario.add(suspendido.firstElement());
			}		
			suspendido.shift();
			tiempoSuspendido=0;
		}
	}
	if(interactivos.length()>0){
		if(interactivos.firstElement().envejecimiento==topeEnvejecimiento){
			interactivos.setPrioridad(interactivos.firstElement(),1);			
			sistema.add(interactivos.firstElement());
			sistema.setQuantum(interactivos.firstElement(),generarQuantum(interactivos.firstElement().tiempo));	
			$("#P" + interactivos.firstElement().id).html("<div class='span12' id='P"+interactivos.firstElement().id+"' style='height:20px; background-color:"+interactivos.firstElement().color+"; float:left; text-align:center;'><span class='pequeno'>Id "+interactivos.firstElement().id+" T "+interactivos.firstElement().tiempo+" Q "+interactivos.firstElement().quantum+" TL "+interactivos.firstElement().tiempoLlegada+"</span></div>");
			$("#P" + interactivos.firstElement().id).appendTo("#sistema");
			interactivos.shift();
		}
	}
	if(usuario.length()>0){
		if(usuario.firstElement().envejecimiento==topeEnvejecimiento){			
			usuario.setPrioridad(usuario.firstElement(),2);
			usuario.clearEnvejecimiento();
			interactivos.add(usuario.firstElement());
			$("#P" + usuario.firstElement().id).html("<div class='span12' id='P"+usuario.firstElement().id+"' style='height:20px; background-color:"+usuario.firstElement().color+"; float:left; text-align:center;'><span class='pequeno'>Id "+usuario.firstElement().id+" T "+usuario.firstElement().tiempo+" TL "+usuario.firstElement().tiempoLlegada+"</span></div>");
			$("#P" + usuario.firstElement().id).appendTo("#interactivos");
			usuario.shift();
		}
	}
	
};

var generarQuantumSuspendido = function(tiempoEjecucion){
	return Math.floor(tiempoEjecucion*(1/2)+3);
};

var clasificar = function(proceso){
	console.log(proceso.prioridad);
	if(proceso.prioridad==1){
		sistema.add(proceso);
	}else if(proceso.prioridad==2){
		proceso.bloqueado=true;
		interactivos.add(proceso);
	}else{
		usuario.add(proceso);
	}
};

var generarTiemposLlegada = function(){
	var temp = Math.floor((Math.random()*numeroProcesos)+1);
	if(tiemposLlegada.length<numeroProcesos){
		if(tiemposLlegada.indexOf(temp)==-1){
			tiemposLlegada.push(temp);
		}
		generarTiemposLlegada();
	}
};

var comparar = function(proceso){
	var temp=null;
	for(var i=0;i<interactivos.length;i++){
		if(interactivos.getElement(i).tiempo<proceso.tiempo ){
			temp=interactivos.getElement(i);
		}
	}
	if(temp==null){
		temp=proceso;
	}
	return temp;
};

var generarTiempos=function(){
	var temp = Math.floor((Math.random()*12)+4);
	if(tiempos.length<numeroProcesos){
		if(tiempos.indexOf(temp)==-1){
			tiempos.push(temp);
		}
		generarTiempos();
	}
};

var usoRecurso = function(){
	return porcentaje = Math.floor((Math.random()*100)+1);
};

var generarColor=function(){
	var letras = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letras[Math.round(Math.random() * 15)];
    }
    return color; 
};

var generarQuantum=function(tiempoEjecucion){
	return Math.floor(tiempoEjecucion*(2/3)+1);
};

var bloqueo=function(){
	var num = Math.floor((Math.random()*10)+1);
	if(num <= 3){
		return true; //bloqueadooo
 	}else{
 		return false; //no bloqueado
	}
};

var ordenarProcesos = function(cola){
	for(var i=0;i<cola.length()-1;i++){
		for(var j=i+1;j<cola.length();j++){
			if(cola.getElement(i).tiempoLlegada>cola.getElement(j).tiempoLlegada){
				var temp=cola.getElement(i);
				cola.replace(i,cola.getElement(j));
				cola.replace(j,temp);
			}
		}
	}
};

var actualizarRecursos=function(procesoActual){
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

var generarPrioridades=function(){
	if(prioridades.length<numeroProcesos){
		prioridades.push(Math.floor((Math.random()*3)+1));
		generarPrioridades();
	}
};

