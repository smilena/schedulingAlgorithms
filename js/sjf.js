var numeroProcesos;
var espera=[];
var bloqueado=[];
var listo=[];
var ejecucion=[];
var suspendido=[];
var recursos = [0,0,0,0]; //el uso de recursos inicia en 0
var colores=[];
var gantt=[];
var tiempos=[];
var tiemposLlegada=[];
var tiempoBloqueo=0;
var tiempoSuspendido=0;
var procesoInicial=false;

$("#desbloquear").bind("click",function(){
	$("#P" + bloqueado[0]["id"]).appendTo($("#espera"));
	espera.push(bloqueado[0]);
	bloqueado.splice(0,1);
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
	numeroProcesos= Math.floor((Math.random()*20)+1);
	$("#datos tbody").css("height","0");
	generarTiemposLlegada();
	generarTiempos();
	for(var i = 1;i<=numeroProcesos;i++){
		var colorTemp=generarColor();
		$("#datos tbody").append("<tr><td style='color:"+colorTemp+";'>"+i+"</td><td><span>"+tiempos[i-1]+"</span></td><td>"+tiemposLlegada[i-1]+"</td></tr>");
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
			gantt:""			
		};
		espera.push(temp);
	}
	ordenarProcesos();	
};

function replaceAt(s, n, t) {
    return s.substring(0, n) + t + s.substring(n + 1);
}

var analisisProcesos = function() {
		
		if($("#ejecucion div").length == 0 && $("#espera div").length == 0 && $("#bloqueado div").length == 0 && $("#suspendido div").length == 0) {window.clearInterval(procesamiento)};	
		
		if(!procesoInicial){
			$.each(espera,function(index,proceso){
				if(proceso.tiempoLlegada==0){
					$("#P" + proceso.id).appendTo($("#ejecucion"));
					ejecucion.push(proceso);
					actualizarRecursos(proceso);
			  		espera.splice(espera.indexOf(proceso),1);
				}
			});
			procesoInicial=true;
		}
		if ($("#ejecucion div").length > 0) {			
			if (esperaProceso == ejecucion[0]["tiempo"]){	
		 		if(bloqueo() && !ejecucion[0].bloqueado){
					mensajeBloqueo();
					bloqueado.push(ejecucion[0]);
					$("#P" + ejecucion[0]["id"]).appendTo("#bloqueado");
					ejecucion[0].bloqueado=true;
					tiempoBloqueo=0;
				}else{
		    		$("#P" + ejecucion[0]["id"]).appendTo("#listo");
					listo.push(ejecucion[0]);
		    	}			    	
		    	ejecucion.splice(0,1);
				esperaProceso = 0;		
			}else{
				esperaProceso++;
			}

		}else if($("#espera div").length > 0){

			$("#P" + espera[0]["id"]).appendTo($("#ejecucion"));
			ejecucion.push(espera[0]);
			actualizarRecursos(ejecucion[0]);
		  	espera.splice(0,1);	  	
		}
		if($("#bloqueado div").length>0){
			if(tiempoBloqueo<7 && bloqueado.length>0){
			tiempoBloqueo++;
			console.log(tiempoBloqueo);
			}else if(tiempoBloqueo==7){
				$("#P" + bloqueado[0]["id"]).appendTo($("#suspendido"));
				suspendido.push(bloqueado[0]);
				console.log(suspendido[0]);
				bloqueado.splice(0,1);
				tiempoBloqueo=0;
			}
		}
		if($("#suspendido div").length>0){		
			if(tiempoSuspendido<10 && suspendido.length>0){
				tiempoSuspendido++;
			}else if(tiempoSuspendido==10){
				$("#P" + suspendido[0]["id"]).appendTo($("#espera"));
				espera.push(suspendido[0]);
				suspendido.splice(0,1);
				tiempoSuspendido=0;
			}
		}
};

var iniciarSimulacion = function () {
	window.esperaProceso=0;
    window.procesamiento = window.setInterval(analisisProcesos, 2000);	
};

var ordenarProcesos = function(){
	for(var i=0;i<numeroProcesos-1;i++){
		for(var j=i+1;j<numeroProcesos;j++){
			if(espera[i].tiempo>espera[j].tiempo){
				var temp=espera[i];
				espera[i]=espera[j];
				espera[j]=temp;
			}
		}
	}
};

$("#simular").bind("click",function(){
	
	//crear procesos
	crearProcesos();
	inicializarGantt();
	generarDiagramaGantt();
	crearProcesos();
	
	$.each(espera,function(index,proceso){				
		$("#espera").append("<div class='span12' id='P"+proceso.id+"' style='height:20px; background-color:"+proceso.color+"; float:left; text-align:center;'><span class='pequeno'>Id "+proceso.id+" T "+proceso.tiempo+" TL "+proceso.tiempoLlegada+"</span></div>");		
	});
	
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

var generarTiemposLlegada = function(){
	var temp = Math.floor((Math.random()*numeroProcesos));
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
	$.each(espera,function(index,proceso){
		if(proceso.tiempoLlegada==0){
			espera.unshift(proceso);
			
	  		espera.splice(index+1,1);
	  		console.log(espera);
	  		return false;
		}
	});

	if(espera.length>0){
		var proceso=espera[0];
		for(var i=0;i<proceso.tiempo;i++){
			var id=proceso.id-1;
			gantt[id]+="X";	
			llenarEspera(id);			
		}
		espera.splice(0,1);			
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
			
				console.log(gantt[i].charAt(j));
			}else{
				break;
			}
		}
	}
	for(var i=0;i<gantt.length;i++){
		for(var j=0;j<gantt[i].length;j++){
			if(j<tiemposLlegada[i] && gantt[i].charAt(j)=="E"){
				gantt[i]=replaceAt(gantt[i],j," ");			
				console.log(gantt[i].charAt(j));
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
