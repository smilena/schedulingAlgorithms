var queue = function() {

    var elements;
    this.add = function(element) {
        if (typeof(elements) === 'undefined') {
            elements = [];   
        }
        elements.push(element);                       
    };

    this.shift = function() {    	
        elements.shift();                                                	
    };

    this.firstElement = function(){
        return elements[0];                  
    };

    this.tam= function(){
        return (elements.length);
    };

    this.getElement = function(index){
    	return elements[index];
    };

    this.replace=function(indexPrev, element){
    	elements[indexPrev]=element;
    };

    this.allElements = function(){
    	return elements;
    };

    this.setNewTime = function(element, time){
    	var indexElemento = elements.indexOf(element);
    	elements[indexElemento].tiempo-=time;
    };

    this.splice =function(proceso){
    	elements.splice(elements.indexOf(proceso),1);
    };

    this.setGantt = function(element,caracter){
    	var indexElemento = elements.indexOf(element);
    	elements[indexElemento].gantt+=caracter;
    };
};


var numeroProcesos;
var espera=new queue;
var bloqueado=new queue();
var listo=new queue();
var ejecucion=new queue();
var suspendido=new queue();
var recursos = [0,0,0,0]; //el uso de recursos inicia en 0
var colores=[];
var gantt=[];
var tiempos=[];
var tiemposLlegada=[];
var prioridades=[];
var tiempoBloqueo=0;
var tiempoSuspendido=0;
var procesoInicial=false;
var contadorGlobal=0;
var ok=false;

$("#desbloquear").bind("click",function(){
	$("#P" + bloqueado.firstElement().id).appendTo($("#espera"));
	espera.add(bloqueado.firstElement());
	bloqueado.shift();
});

$("#generarGantt").bind("click",function(){
	$("#RR").hide("slow");
	$(".hide").show("slow");
	imprimirDiagramaGantt();
});

$("#regresar").bind("click",function(){
	$("#RR").show("slow");
	$(".hide").hide("slow");
});

$("#generarTabla").bind("click", function(){
	numeroProcesos= Math.floor((Math.random()*5)+1);
	$("#datos tbody").css("height","0");
	generarPrioridades();
	generarTiemposLlegada();
	generarTiempos();
	for(var i = 1;i<=numeroProcesos;i++){
		var colorTemp=generarColor();
		$("#datos tbody").append("<tr><td style='color:"+colorTemp+";'>"+i+"</td><td><span>"+tiempos[i-1]+"</span></td><td>"+prioridades[i-1]+"</td><td>"+tiemposLlegada[i-1]+"</td></tr>");
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
			prioridad:prioridades[i-1],
			bloqueado:true,
			tiempoLlegada:tiemposLlegada[i-1],
			gantt:[]	
		};
		espera.add(temp);
	}
	ordenarProcesos();	
};

function replaceAt(s, n, t) {
    return s.substring(0, n) + t + s.substring(n + 1);
}

var analisisProcesos = function() {
		
		if($("#ejecucion div").length == 0 && $("#espera div").length == 0 && $("#bloqueado div").length == 0 && $("#suspendido div").length == 0) {window.clearInterval(procesamiento)};	
		
		/*if(!procesoInicial){
			for(var i=0;i<espera.tam();i++){
				if(espera.getElement(i).tiempoLlegada==0){
					$("#P" + espera.getElement(i).id).appendTo($("#ejecucion"));
					ejecucion.add(espera.getElement(i));
					actualizarRecursos(espera.getElement(i));
					espera.splice(espera.getElement(i));
				}
			}
			procesoInicial=true;
		}*/
		if ($("#ejecucion div").length > 0) {

			if (ejecucion.firstElement().tiempo==0 ){	
		 		if(bloqueo() && !ejecucion.firstElement().bloqueado){
					mensajeBloqueo();
					//ejecucion[0].tiempo=tiempos[ejecucion[0].id-1];
					bloqueado.add(ejecucion.firstElement());
					$("#P" + ejecucion.firstElement().id).appendTo("#bloqueado");
					$("#P"+ejecucion.firstElement().id).find("span.pequeno").html("Id "+ejecucion.firstElement().id+" T "+ejecucion.firstElement().tiempo+" TL "+ejecucion.firstElement().tiempoLlegada+" Pri "+ejecucion.firstElement().prioridad);
					ejecucion.firstElement().bloqueado=true;
					tiempoBloqueo=0;
				}else{
		    		$("#P" + ejecucion.firstElement().id).appendTo("#listo");
		    		$("#P"+ejecucion.firstElement().id).find("span.pequeno").html("Id "+ejecucion.firstElement().id+" T "+ejecucion.firstElement().tiempo+" TL "+ejecucion.firstElement().tiempoLlegada+" Pri "+ejecucion.firstElement().prioridad);
					listo.add(ejecucion.firstElement());

		    	}			    	
		    	ejecucion.shift();
				esperaProceso = 0;		
			}else{
				ejecucion.firstElement().tiempo=ejecucion.firstElement().tiempo-1;	
				var temp=comparar(ejecucion.firstElement());
				ejecucion.setGantt(ejecucion.firstElement(),"X");
				if(temp!=ejecucion.firstElement()){
					suspendido.add(ejecucion.firstElement());
					$("#P"+ejecucion.firstElement().id).find("span.pequeno").html("Id "+ejecucion.firstElement().id+" T "+ejecucion.firstElement().tiempo+" TL "+ejecucion.firstElement().tiempoLlegada+" Pri "+ejecucion.firstElement().prioridad);
					$("#P" + ejecucion.firstElement().id).appendTo($("#suspendido"));
					ejecucion.add(temp);
					$("#P" + temp.id).appendTo($("#ejecucion"));
					ejecucion.shift();
					setTimeout(function(){
						$("#P" + suspendido.firstElement().id).appendTo($("#espera"));
						espera.add(suspendido.firstElement());
						suspendido.shift();
						tiempoSuspendido=0;
					},1000);
				}
				
				//espera.splice(ejecucion.firstElement());	
				
				contadorGlobal++;
				console.log(contadorGlobal);
				
				llenarOtros();
			}

		}else if($("#espera div").length > 0){
			var temp=comparar(espera.firstElement());

			$("#P" + temp.id).appendTo($("#ejecucion"));
			ejecucion.add(temp);
			actualizarRecursos(temp);
		  	espera.splice(temp);	
		}
		
		
};

var llenarOtros = function(){
	for(var i=0;i<espera.tam();i++){
		if(espera.getElement(i).tiempoLlegada<contadorGlobal){
			espera.setGantt(espera.getElement(i),"E");
		}else{
			espera.setGantt(espera.getElement(i)," ");
		}		
	}
	for(var i=0;i<bloqueado.tam();i++){
		espera.setGantt(espera.getElement(i),"B");
	}
	for(var i=0;i<suspendido.tam();i++){
		espera.setGantt(espera.getElement(i),"S");
	}
};


var iniciarSimulacion = function () {
	window.esperaProceso=0;
    window.procesamiento = window.setInterval(analisisProcesos, 2000);	
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

var comparar = function(proceso){
	var temp=null;
	for(var i=0;i<espera.tam();i++){
		if(espera.getElement(i).prioridad>proceso.prioridad && espera.getElement(i).tiempoLlegada<=contadorGlobal){
			temp=espera.getElement(i);
		}
	}
	if(temp==null){
		temp=proceso;
	}
	return temp;
};

$("#simular").bind("click",function(){
	
	//crear procesos
	crearProcesos();
	//inicializarGantt();
	//generarDiagramaGantt();
	//crearProcesos();
	
	for(var i=0;i<espera.tam();i++){
		$("#espera").append("<div class='span12' id='P"+espera.getElement(i).id+"' style='height:20px; background-color:"+espera.getElement(i).color+"; float:left; text-align:center;'><span class='pequeno'>Id "+espera.getElement(i).id+" T "+espera.getElement(i).tiempo+" TL "+espera.getElement(i).tiempoLlegada+" Pri "+espera.getElement(i).prioridad+"</span></div>");		

	}
	iniciarSimulacion();
});

var generarTiempos=function(){
	var temp = Math.floor((Math.random()*20)+4);
	if(tiempos.length<numeroProcesos){
		if(tiempos.indexOf(temp)==-1){
			tiempos.push(temp);
		}
		generarTiempos();
	}
};

var generarPrioridades = function(){
	var temp = Math.floor((Math.random()*numeroProcesos));
	if(prioridades.length<numeroProcesos){
		if(prioridades.indexOf(temp)==-1){
			prioridades.push(temp);
		}
		generarPrioridades();
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

var generarTiemposLlegada = function(){
	var temp = Math.floor((Math.random()*(numeroProcesos+6)));
	if(tiemposLlegada.length<numeroProcesos){
		if(tiemposLlegada.indexOf(temp)==-1){
			tiemposLlegada.push(temp);
		}
		if(tiemposLlegada.indexOf(0)==-1 && tiemposLlegada.length==Math.floor(numeroProcesos/2)){
			tiemposLlegada.push(0);
		}
		generarTiemposLlegada();
	}
};

var ordenarListo = function(){
	for(var i=0;i<listo.tam()-1;i++){
		for(var j=i+1;j<listo.tam();j++){
			if(listo.getElement(i).id>listo.getElement(j).id){
				var temp=listo.getElement(i);
				listo.replace(i,listo.getElement(j));
				listo.replace(j,temp);
			}
		}
	}
};

var imprimirDiagramaGantt=function(){	
	ordenarListo();
	for(var i=0;i<numeroProcesos;i++){
		var linea = "";
		for(var j=0;j<listo.getElement(i).gantt.length;j++){
			linea+="<td>"+listo.getElement(i).gantt[j]+"</td>";
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
