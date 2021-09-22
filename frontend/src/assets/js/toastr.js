/*
Template Name: Material Pro admin
Author: Wrappixel
Email: niravjoshi87@gmail.com
File: js
*/
const toastInitFunctions = () => {
     $(function() {
         "use strict";
           $(".tst1").click(function(){
                $.toast({
                 heading: 'Welcome to Material Pro admin',
                 text: 'Use the predefined ones, or specify a custom position object.',
                 position: 'top-right',
                 loaderBg:'#ff6849',
                 icon: 'info',
                 hideAfter: 3000, 
                 stack: 6
               });
     
          });
     
           $(".tst2").click(function(){
                $.toast({
                 heading: 'Falta de pago',
                 text: 'El centro deportivo tiene turnos reservados con pagos pendientes. Por favor revise los turnos recientemente reservados y solicite el pago o cancele el turno.',
                 position: 'top-right',
                 loaderBg:'#ff6849',
                 icon: 'warning',
                 hideAfter: 15000, 
                 stack: 6
               });
     
          });
           $(".tst3").click(function(){
                $.toast({
                 heading: 'Welcome to Material Pro admin',
                 text: 'Use the predefined ones, or specify a custom position object.',
                 position: 'top-right',
                 loaderBg:'#ff6849',
                 icon: 'success',
                 hideAfter: 3500, 
                 stack: 6
               });
     
          });
     
           $(".tst4").click(function(){
                $.toast({
                 heading: 'Deuda',
                 text: 'Un turno fue cancelado y ya tenía un pago realizado. Por favor revise la sección deudas para saldar las mismas.',
                 position: 'top-right',
                 loaderBg:'#ff6849',
                 icon: 'error',
                 hideAfter: 15000,                 
               });
     
          });
          $(".entrySuccess").click(function(){
               $.toast({
                heading: 'Ingreso Exitoso',
                position: 'top-center',
                loaderBg:'#d4edda',
                icon: 'success',
                hideAfter: 3500,
                stack: 6
                
              });
     
         });
     });
}