var developer=false
var firstPrevScroll=0;
var secondPrevScroll=0;
$(document).ready(function(){
    
    alert('hello')
    $(window).on('scroll',"#firstScr", function(){console.log("Hello")});
})
function handleSecondColumn()
{
        console.log("developer")
        // let firstScroll=$('#firstScr').scrollTop()
        // let secondScroll=$(window).scrollTop()
        // let diff=firstScroll-firstPrevScroll;
        // developer=true
        // $(window).scrollTop(secondScroll+diff)
        // developer=false
        // firstPrevScroll=firstScroll;
    
    
}
function handleFirstColumn()
{

    console.log("developer 1")


        console.log(developer)
        if(developer)
        {
            let firstScroll=$('#firstScr').scrollTop()
            let secondScroll=$(window).scrollTop()
            let diff=firstScroll-firstPrevScroll;
            developer=true
            $(window).scrollTop(secondScroll+diff)
            developer=false
            firstPrevScroll=firstScroll;
        }
    
}








































































// ////// Variables ////////
// var lastScroll


// var windowHeight=0;
// var scrollHeight=0;

// var firstColumnHeight=0
// var secondColumnHeight=0
// var thirdColumnHeight=0

// var firstPaddingTop=0;
// var secondPaddingTop=0;
// var thirdPaddingTop=0;

// var keywordApiLoading=""
// var authorApiLoading=""
// var authorUpScrollLock=""

// var top = 0;
    
// $(document).ready(function(){

//     $(window).scroll(() => {
           
//         let scroll=$(window).scrollTop()
//         console.log("Last scroll is ",lastScroll)
//         console.log("New Scroll is",scroll)
//         if(scroll>lastScroll)
//         {
//             // Handle down Scrolling
//             handlePreDownScroll()           
//             handleFirstColumn()
//             handleThirdColumn()
//             if(keywordApiLoading=="true")
//             {
//                 handleSecondColumn()
//             }
//         }
//         else{
            
//         //Handle Up Scrolling

        
//             handlePreUpScroll();
//             handleUpFirstColumn()
//             handleUpThirdColumn()
//             if(keywordApiLoading=="true")
//             {
//                 handleUpSecondColumn()
//             }

//         }
//         lastScroll=scroll;



    
//         })
// })      

// function InitializeVariables()
// {
//      windowHeight = $(window).height();
//      scrollHeight = $(window).scrollTop();


//     firstColumnHeight=$('#firstInnerScr').height();
//     secondColumnHeight=$('#favouriteSecond').outerHeight()
//     thirdColumnHeight=$('#thirdInnerScr').height();

//     firstPaddingTop=parseInt($('#firstScr').css('paddingTop').slice(0,-2))
//     secondPaddingTop=parseInt($('#favouriteSecond').css('paddingTop').slice(0,-2))
//     thirdPaddingTop=parseInt($('#thirdInnerScr').css('paddingTop').slice(0,-2))




//     keywordApiLoading=$('#firstScr').attr('keywordApiLoading')
//     authorUpScrollLock=$('#thirdInnerScr').attr('authorUpScrollLock')
//     // alert(authorUpScrollLock)
//     // alert(keywordApiLoading)



//     console.log("setting",scrollHeight)
//     console.log("setting first Height",firstColumnHeight)
//     console.log("setting first Paddding",firstPaddingTop)
    
// }
// function handlePreDownScroll()
// {

//     InitializeVariables()
//     let paddingTop=scrollHeight
//     console.log("handlePreDownScroll",$('#thirdInnerScr').css('position')==='fixed')
//     console.log("second is", $('#thirdInnerScr').css('top'))
//     console.log('position',$('#firstScr').css('top'))
//     if($('#firstScr').css('position')==='fixed' &&  $('#firstScr').css('top')>='50px')
//     {
//         console.log("Scrlling First Column")
//         scrollColumn('firstScr',paddingTop) 
//         // this.updateState=false;
        
//         // this.setState({
//         //     firstPaddingTop:paddingTop
//         // })
//     }
//     if($('#thirdInnerScr').css('position')==='fixed' && $('#thirdInnerScr').css('top')=='52px')
//     {
//         console.log("SCrolling Third Column")
//         console.log("scrolling third 942")
//         console.log("scrolling third 945")
//         scrollColumn('thirdInnerScr',paddingTop);
//         // this.updateState=false;
        
//         // this.setState({
//         //         thirdPaddingTop:paddingTop
//         //     })
//     }
// }
// function handlePreUpScroll()
// {
    
//     InitializeVariables()
//     console.log("Pre Scroll is ",$('#thirdInnerScr').css('position')==='fixed' )
//     console.log("After Scroll is ",$('#thirdInnerScr').css('bottom')=='0px')
//     if($('#thirdInnerScr').css('position')==='fixed' && $('#thirdInnerScr').css('bottom')=='0px')
//     {
//         InitializeVariables();
//         let prevScrollKeyword=(scrollHeight+windowHeight)-$('#thirdInnerScr').outerHeight();
//         console.log("SCrolling",prevScrollKeyword)
//         console.log("scrolling third 1175")
//         this.scrollColumn('thirdInnerScr',prevScrollKeyword)

//     }
//     if( $('#firstScr').css('position')==='fixed' &&  $('#firstScr').css('bottom')=='0px')
//     {
//         InitializeVariables();
//        let paddingTop=(windowHeight + scrollHeight)-$('#firstInnerScr').outerHeight()
        
//         console.log("Calculating at Seconde if")
//         console.log("Scrolling First Column",paddingTop)
//         //alert12143')

//         scrollColumn('firstScr',paddingTop)
    
//     }
// }
// function handleFirstColumn()
// {
    
//     InitializeVariables()
//     console.log("panga position is ",$('#favouriteSecond').height());
//     console.log("First is ",(windowHeight + scrollHeight))
//     console.log("for",firstColumnHeight+firstPaddingTop)
//     console.log("Right Bar Padding is",$('#firstScr').css('paddingTop'))
//     console.log("Right Bar Padding is",firstPaddingTop)
//     console.log("Condition is ",(windowHeight + scrollHeight) >= firstColumnHeight+firstPaddingTop)
//     console.log("Second Condition i s", $('#favouriteSecond').css('position')!=='fixed')
//     console.log("SCroll is ",$(window).scrollTop())
//     let totalHeight =0
//     totalHeight =parseInt(firstColumnHeight)+parseInt(firstPaddingTop)
    
//     console.log("for",totalHeight)
    
//     if((windowHeight + scrollHeight) > totalHeight && $('#favouriteSecond').css('position')!=='fixed' ){
//         console.log("setting first 0")
//         fixcolumn('firstScr',0)
//         firstPaddingTop=0
//         if($(window).height()<$('#firstInnerScr').innerHeight() )
//         {
//            $('#firstScr').css({
//                 bottom:'0'
//             })  
//         }
//     }

//     else{
//             if($('#firstScr').css('position')==='fixed')
//             {
//                 console.log('Scrolling First Colum')
//                 // this.scrollColumn('firstScr',0);
//                 firstPaddingTop=0
//             }
        
//         }
// }
// function handleSecondColumn()
// {
//     InitializeVariables()
//     console.log("Ghalat")
//     console.log("First is ",(windowHeight + scrollHeight))
//     console.log("First is ",secondColumnHeight)
    
//     if((windowHeight+scrollHeight)>secondColumnHeight && $('#firstScr').css('position')!=='fixed')
//     {
        
//         console.log("Fixing")
//         // alert('fixed 911');
//         $('#favouriteSecond').css({
//             paddingTop:0,
//             position:'fixed',
//             width:518

//         })
//         // alert("barkwas"+$(window).height())
//         // alert('for'+$('#favouriteSecond').innerHeight());
//         if($(window).height()<$('#favouriteSecond').innerHeight() )
//         {
            
//             $('#favouriteSecond').css({
//                 bottom:'0'
//             })  
//         }
//         else{
            
//             $('#favouriteSecond').css({
//                 top:53
//             })  
//         }
//     }
// }
// function handleThirdColumn()
// {
//     InitializeVariables()
//     console.log("nine 80 ",(windowHeight + scrollHeight))
//     console.log("greater than",$('#thirdInnerScr').height())
//     console.log("Third Padding Top is ",thirdPaddingTop)
//     console.log("bubbles")
//     if((windowHeight + scrollHeight) >= parseInt(thirdColumnHeight)+parseInt(thirdPaddingTop)){
//         console.log("setting third 0")
//         console.log('issue')
//         fixcolumn('thirdInnerScr',0)
//         if($(window).height()<$('#thirdInnerScr').innerHeight() )
//         {
            
//             $('#thirdInnerScr').css({
//                 bottom:'0'
//             })  
//         }
        
//     }   
// }
// function handleUpFirstColumn()
// {
//     InitializeVariables()
//     console.log("Window Height is ",windowHeight);
//     console.log("first padding to is ",firstPaddingTop)
//     console.log("scroll height is ",scrollHeight)
//     console.log("First condition is ",windowHeight+firstPaddingTop)
//     if((windowHeight +firstPaddingTop) >= scrollHeight && firstPaddingTop>1){
//         console.log("setting first 0")       
//         console.log("fixing First Columns")
//         // alert('fixing')
//         fixcolumn('firstScr',0)
//         $('#firstScr').css({
//             top:52,bottom:'' 
//         })  
//         console.log("idealogy is ",$('#firstScr').css('top'))
//         console.log("idealogy is ",$('#firstScr').css('bottom'))
//         $('.left').addClass("offset-md-3")

//     }
// }
// function handleUpSecondColumn()
// {
 
//     InitializeVariables()
//     let scroll=$(window).scrollTop()
//     if(scroll<secondPaddingTop)
//     {
        
//         console.log("fixing")

//         // alert("1174")
//         $('#favouriteSecond').css({
//             paddingTop:0,
//             position:'fixed',
//             bottom:'',
//             width:518
//         })

//     }
// }
// function handleUpThirdColumn()
// {
//     InitializeVariables()
//     if((windowHeight + thirdPaddingTop) >= scrollHeight && thirdPaddingTop>1){
//         // console.log("line  710")   
//         console.log("fixing")    
//         console.log("setting third 0")       
//         console.log("fixing Third Columns")
//         console.log('setting padding 0')
//         fixcolumn('thirdInnerScr',0)
//         $('#thirdInnerScr').css({
//             top:52,bottom:'' 
//         })  
//         console.log("idealogy is ",$('#thirInnerScr').css('top'))
//         console.log("idealogy is ",$('#thirdInnerScr').css('bottom'))
       
    
//     }

// }

// function fixcolumn(id,padding){
//     console.log("bello app script "+id)
//     InitializeVariables()
//     console.log('Fixing Column with id ',id)
//     $(`#${id}`).css({
//         position:'fixed',
//         paddingTop:padding,
//         bottom:'',
//         top:'',
//         marginLeft:'6px'
//     })
    
//     if(id==='firstScr')
//     {
        
//         $('.left').addClass("offset-md-3")
//         console.log("deal")
//     }
//     else if(id==='thirdInnerScr')
//     {
        
//         // alert('Script')
//         $(`#${id}`).css({
//             marginLeft:'4px'
//         })
//         console.log('fixing Third Column');
//         // alert('fixing Third column')            
//     }
            
            
            
            

// }
// function scrollColumn(id,padding)
// {
//     InitializeVariables()
//     console.log('Lucifer scrolling'+id)
//     console.log('Lucifer scrolling'+padding)
//     $(`#${id}`).css({
//         position: 'static',
//         left: '',
//         bottom: '',
//         marginLeft:'',
//         paddingTop:padding
//     })
    
    
//     if(id==='firstScr')
//     {
//         // alert('scroll first script js')
//         $('.left').removeClass("offset-md-3")
//     }
//     else if(id==='thirdInnerScr')
//     {
//         // alert('scroll first script js')


//         console.log("Got request for thiird")        
//     }
// }


// function reApplyConstraints(){
//     alert("hello");
// }