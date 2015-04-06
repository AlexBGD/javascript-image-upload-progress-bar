

var js_bar={
     
     max_filesize_MB:10,
     server_script:null,
     extension:['jpg','png','jpeg'],
     ext_insensitive:true,
     upload_limit:10,
     progress_holder:'main-progress-holder',
     errors:[],
     images_num:0,
     main_div_id:"js-bar",
     cancel:[],
     error_templates:{
        max_filesize_msg:"Maksimalna velicina slike je 10 MB.",
        extension_msg:"Dozvoljene extenxzije su: jpg,png,jpeg",
        upload_limit_msg:"Maksimalan broj slika po oglasu je 10."
    },
   
     
     /**
      * 
      * @param {type} files
      * @returns {js_bar.validation.images|Array}
      * 
      * 
      * SLEDECE TRI METODE SLUZE ZA VALIDACIJU.
      * Method validation vraca array sa fajlovima koji su prosli validaciju
      * ili vraca prazan array
      * 
      * 
      * 
      * 
      */
     
     
     validation:function(files){
        /* if (!Array.isArray(this.extension)) {
             throw 'EXTENSION MUST BE ARRAY FORMAT! EXAMPLE:this.extension=["jpg","png"]';
         }*/
         var images=[],
                 i,
                 files_length=files.length;
         for(i=0;i<files_length;i++){
             if (this.validation_type(files[i])&&this.validation_size(files[i])) {
                     images.push(files[i])
                  }
         }
         return images;
     },
     
      validation_type:function(file){   
             if (!('name' in file)) {
                 throw "FILE NAME IS NOT SET!";
             }  
             var ext=file.name.slice(file.name.lastIndexOf('.')+1).toLowerCase(); 
             if (this.extension.indexOf(ext)>-1) {
                    return true;
             }
             this.onerror('ext')
              return false;
     },
     
    validation_size:function(file){  
         if (this.max_filesize_MB==-1) {
            // console.log('Image validation size is not definaid!');
            return true;
         }else if(!('size' in file)){
             throw 'SIZE IS NOT DEFINAID!';
         }
        // console.log(parseFloat(this.file_to_MB(file.size)))
         if (parseFloat(this.file_to_MB(file.size))>this.max_filesize_MB) {
            this.onerror('size')
             return false;
         }
         return true;
    },
     //-----------------------------------------------------------------
     
     
     
     
     /**
      * 
      * @param {object(array like)} el
      * @returns {Boolean}
      * 
      * PUBLIC METHOOD poziva ga event onchange na input type="file"
      * poziiva validaciju  i proverava da li ima jos mesta
      * 
      */
     
     onchange:function(el){
         var free_img=this.upload_limit-this.images_num,
                 file=el.files;
         this.errors=[];
         
         if (free_img===0) {
            this.onerror('limit');
            return false;
         }
         file=this.validation(file)
         
         if (file.length===0) {
             if (this.errors.length>0) {
               alert(this.errors.join('\n'))
}
             return false;
}
           
         /*
          * ovo sprecava sl. stvar
          * ako korisnik upload npr. 6 fotki prvi put
          * a zatim drugi put upload 5 fotki onda 
          * se u while petlji vrti dok se semanji broj na maximalan broj 
          * dozvoljenih fotki npr 10
          * 
          * 
          */
    
         if (file.length>free_img) {
             var num=0,
                     newFile=[];
             while(num!==free_img){
                 num++;
                 newFile.push(file[num]);
       
             }
             file=newFile;
             alert('Maximalni broj slika je 10!')
            }
            
     //---------------------------------------------------------    
     this.update_list();
        this.upload(file);
     },
     
     
     
     /**
      * 
      * @param {type} file
      * @returns {undefined}
      * 
      * 
      * 
      * PRAVI UPLOAD PROGRESS POZIVA  xhr...
      * 
      * 
      * 
      */
     upload:function(file) { 
         var that=this,
                 id,
                 i,
                 fd,
                 xhr=new XMLHttpRequest(),
                 file_length=file.length,
                 file_counter=0;
         for(i=0;i<file_length;i++){
           
             ++this.images_num;
             xhr = new XMLHttpRequest();
             this.create_progress(file[i].name,file[i].size,this.images_num,xhr);
             
             fd = new FormData();
             fd.append("imageHTML5",file[i]);
             fd.append("imageHTML5_id",this.images_num);
             
             /*
              * infamous loop problem
              */
                (function(id){
                     xhr.upload.addEventListener("progress", function(e){
                         var percentComplete = Math.round(e.loaded * 100 / e.total),
                                 progress_bar=document.getElementById('progress_bar_'+id);
                             progress_bar.style.width=percentComplete.toString()+"%";
                             progress_bar.innerHTML=percentComplete.toString()+"%";
                 }, false);
                })(that.images_num);
                //-----------------------------------------
                
                 xhr.addEventListener("load", function(e){
                  var data=JSON.parse(e.target.responseText);
                          that.show_image(data);
                          that.remove_progress_bar(data.id);
                          that.onsuccess(e);
                          if (++file_counter===file_length) { that.update_list(); }
                 }, false);
                
                (function(id){
                    xhr.addEventListener("error", function(e){
                            that.onupload_error(e)
                            that.remove_progress_bar(id);
                            if (++file_counter===file_length) { that.update_list(); }
                 }, false);
                })(that.images_num);
                 
                 (function(id){
                    xhr.addEventListener("abort", function(e){
                        var sortable=that.by_id('sortable');
                        sortable.removeChild(that.by_data_attr(id))
                        sortable.appendChild(that.create_el('li',{
                                 className:'fake-sortable',
                                 style:{
                                     width:'100px'
                                 }
                             }));
                    
                     that.ajax_delete_img(function(){
                                that.images_num--;
                            }); 
                           that.oncancel(e);
                           that.remove_progress_bar(id);
                         if (++file_counter===file_length) { that.update_list(); }
                 }, false); 
                 })(that.images_num);
                 
                 
                 
                 
                 
                 xhr.open("POST", that.server_script,true);
                 xhr.send(fd);
         }
      this.update_list();
      },
      
      
      /**
       * 
       * @param {type} id
       * @returns {Boolean|js_bar.by_data_attr.childs|document@call;getElementById.children}
       * VRACA EL po data attributu
       */
      by_data_attr:function(id){
         var sortable=this.by_id('sortable'),
                 i,
                 childs=sortable.children; 
         for(i=0;i<childs.length;i++){
             //console.log(childs[i]);
             if (childs[i].getAttribute("data-id")==id) {
                 return childs[i]
}
         }
         
         return false;
         
      },
      

      
      
      by_id:function(id){
        return document.getElementById(id);  
      },
      
      
  
      
      
      
      
      
      
      
      
      /**
       * 
       * @param {type} progress_id
       * @returns {undefined}
       * 
       * BRISE DOM ELEMENT KOJI SADRZI  PROGRESS BAR DIV 
       * UZ POMOC JQUERY ANIMACIJE
       */
      remove_progress_bar:function(progress_id){ 
          var that=this;
          
          this.jquery_animate('progress-hodler-id_'+progress_id)
          
     /*   setTimeout(function(){
             that.by_id(that.progress_holder).removeChild(that.by_id('progress-hodler-id_'+progress_id));
        },1000);*/
      },
      /**
       * 
       * @param {type} data
       * @returns {undefined}
       * PRIKAZUJE SLIKU U JQUERY UI  sortable drag and drop listi
       * 
       * 
       */
        show_image:function(data){
             var el=this.by_data_attr(data.id),
                    that=this,del;
             if (!el) {throw 'CANNOT FIND ELEMENT BY DATA ATTRIBUTE!';}
             el.className="ui-state-default";
             el.setAttribute('data-src',data.img)
             del=this.create_el('a',{
                href:"#",
                style:{
                    'position':'absolute',
                    'top':'-2px',
                    right:'-2px',
                    'font-size':'13px',
                    color:'#313131',
                   'background-color':'white'
                },
                onclick:function(e){
                    e.preventDefault();
                    
                    
                    var id='image'+data.id,
                             sortable=that.by_id('sortable');
                             sortable.removeChild(el);
                             sortable.appendChild(that.create_el('li',{
                                 id:id,
                                 className:'fake-sortable',
                                 style:{
                                     width:'100px'
                                 }
                             }));
                             
                             
                             that.update_list();
                             
                            that.ajax_delete_img(function(){
                                that.images_num--;
                            }); 
                        return false;
                }
             });
            del.appendChild(this.create_el('i',{
                className:"fa fa-times",
                title:'Obrisi sliku',
                
            }));
         //   del.style.position='absolute'
            el.appendChild(del)
            el.appendChild(this.create_el('img',{
                src:data.img,
                style:{
                    'max-height':"80px"
                }
            }));
            el.appendChild(this.create_el('a',{
                href:"#",
                innerHTML:'Postavi kao glavnu',
                onclick:function(e){
                     e.preventDefault();
                     that.postavi_kao_glavnu(el);
                     return false;
                }
            
            }));
           // this.update_list();
        },
        
        /**
         * 
         * @param {type} node1
         * @param {type} node2
         * @returns {undefined}
         * 
         * 
         * RADI REPLACE NODOVA u jquery ui drag and drop sortable listi
         * manja li elemente posle brisanja itd...
         */
         swapNodes:function(node1, node2) {
                var node2_copy = node2.cloneNode(true);
                node1.parentNode.insertBefore(node2_copy, node1);
                node2.parentNode.insertBefore(node1, node2);
                node2.parentNode.replaceChild(node2, node2_copy);
         },


         ajax_delete_img:function(callback){
           var fd=new FormData();
                             fd.append('token-delete',new Date().getTime()); 
                            var  xhr = new XMLHttpRequest();
                              xhr.open("POST", 'http://nadjinekretnine.com/ostavi-oglas/del-image',true);
                              xhr.onreadystatechange=function(){
                                    if (xhr.readyState==4 && xhr.status==200) {callback(); }
                              }
                              xhr.send(fd);  
         },

        /**
         * 
         * @returns {Boolean}
         * 
         * 
         * RESETUJE CELU LISTU
         * MENJA TEXT I TAGOVE U SORTABLE JQUERY UI LISTI,
         * resetuje data-id u li elementu sotrable liste da uvek idu po redu
         * da bih se znalo koliko ima slobodnih mesta,
         * i da bih se uploadovale slike po redu
         * Resetuje text ispod liste (Glavna slika i Postavi kao glavnu)
         * 
         * 
         */
        update_list:function(){
             var sortable=this.by_id('sortable'),
                     i=1,c=0,
                     that=this;
             if (sortable.firstElementChild.firstElementChild) {
                 var parent=sortable.firstElementChild;
                
                 if (parent.children[2].nodeName.toLowerCase()==='a') {
                       parent.replaceChild(this.create_el('span',{
                     innerHTML:'Glavna slika',
                     style:{
                         color:'red'
                     }
                 }),parent.children[2]);
                 
    
                 }
             }
                 
                 var children=sortable.children;
                
                 for(i=0;i<children.length;i++){ 
                     children[i].setAttribute("data-id",i+1);
                     if (i>0) {
                     if (children[i].className.indexOf('ui-state-default')>-1) {
                         var sons=children[i].children;  
                         for(c=0;c<sons.length;c++){ 
                             if (sons[c].nodeName.toLowerCase()==='span') {
                                 var CH=children[i];
                                 children[i].replaceChild(this.create_el('a',{
                                     innerHTML:'Postavi kao glavnu',
                                     href:"#",
                                     onclick:function(e){
                                         e.preventDefault(); 
                                            that.postavi_kao_glavnu(CH);
                                            return false;
                                     }
                                  }),sons[c])
                            }
                     }
                  }
                  
                 
                   
             } 
            
           
            
            } 
            return false;
        },
        
        
                create_el:function(el,attr){
          var el=document.createElement(el),
                  x,
                  i;
             for(i in attr){
                 if (i=='style') {
                     for(x in attr[i]){ 
                          el.style[x]=attr[i][x];
                     }
                 }else{
                     el[i]=attr[i]
                 }
                 
             }
           //  console.log(el);
             return el;
    },
        
        
        

        /**
         * 
         * @param {type} el
         * @returns {Boolean}
         * 
         * replace dva noda posle klika na postavi kao glavnu;
         * npr.
         * kada se klikne na "postavi kao glavnu" taj node menja za mesto u sortable listi
         * za node koji je prvi i zatim update listu
         * 
         */
        postavi_kao_glavnu:function(el){ 
            this.swapNodes(this.by_id('sortable').firstElementChild,el);
             this.update_list(); 
            return false;
        },
        
        
    /**
     * 
     * @param {type} filename
     * @param {type} filesize
     * @param {type} id
     * @param {type} xhr
     * @returns {undefined}
     * 
     * pravi progress bar sa sve onclick i cancel upload
     * 
     * 
     * 
     * 
     */
      
      create_progress:function(filename,filesize,id,xhr){
          filename=filename.length>6?filename.substr(0,4)+"..."+filename.substr(-3):filename;
          filesize=this.file_to_MB(filesize)+" MB";
          var that=this;
          
          var holder=this.create_el('div',{
              className:"progress-holder custom_progress-holder",
              id:'progress-hodler-id_'+id
          });
        
          holder.appendChild(this.create_el('span',{
              className:'pull-left',
              id:'file_name_'+id,
              innerHTML:filename
          })); 
          holder.appendChild(this.create_el('span',{
              className:'pull-right',
              id:'file_size_'+id,
              innerHTML:filesize
          }));
          holder.appendChild(this.create_el('div',{className:"clearfix"}));
          
          var progress=this.create_el('div',{
              className:'progress progress-success progress-striped',
              style:{
                  'margin-bottom':'0'
              }
          });
          progress.appendChild(this.create_el('div',{
              className:"bar",
              id:'progress_bar_'+id,
              style:{
                  'margin-bottom':'0'
              }
          }));
          holder.appendChild(progress);
          holder.appendChild(this.create_el('a',{
              style:{
             'font-style':'10px'  ,
             color:'red'
            },
            onclick:function(e){
              xhr.abort();
              e.preventDefault();
              return false;
    },
    className:'fa fa-times pull-right',
    href:"#" ,
    title:"Prekinite učitavanje fotografije!"
        }))
          this.by_id(this.progress_holder).appendChild(holder);
          
      },
      
        chosse_images:function(){//console.log('click');
          // this.by_id('fileToUpload').click();
           $("#fileToUpload").trigger('click')
            //  $("#fileToUpload").click()
     },
     
     
     
     
     
     
     
     file_to_MB:function(size){
        return (Math.round(size * 100 / (1024 * 1024)) / 100)
     },
   
      
      
      
      jquery_animate:function(id){
           $( "#"+id ).hide( 'highlight', {}, 2000, setTimeout(function() {
        $( "#"+id ).remove();
      }, 2000 ) );
          
          
          
          
    },
      
      
      
      
      /*
       * 
       * public mehtods
       * custom events
       * 
       * 
       */
      onsuccess:function(e){},
      onupload_error:function(e){},
      oncancel:function(e){},
      onerror:function(err){
            switch(err){
        case "size":
            alert(this.error_templates.max_filesize_msg);
            break;
        case "ext":
            alert(this.error_templates.extension_msg);
            break;
        case "limit":
            alert(this.error_templates.upload_limit_msg);
            break;
        default:throw 'NEPOZNATA GRESKA U onerror callback'
    }
      },
     //======================================================
     
     
     
     
     
      
      init_html:function(){
          var main=this.by_id(this.main_div_id),
                  i,
                  that=this,
                  form;
          if (!main) { throw 'MAIN DIV DO NOT EXIST!';}
        
        var list=this.create_el('ul',{
            id:'sortable',
            style:{
                'margin-bottom': '20px',
                'overflow': 'auto'
            }
        });
        for(i=0;i<this.upload_limit;i++){
            list.appendChild(this.create_el('li',{
                'data-id':(i+1),
                className:'fake-sortable'
            }));
        }
        
        main.appendChild(list);
        main.appendChild(this.create_el('div',{className:"clearfix"}));
        main.appendChild(this.create_el('button',{
            href:"#",
            className:"btn btn-large btn-danger",
            innerHTML:'Izaberite slike <i class="fa fa-file-image-o"></i>',
            type:"button",
            onclick:function(){
               return  that.chosse_images()
            }
        }));
        main.appendChild(this.create_el('div',{className:"clearfix"}));
        main.appendChild(this.create_el('div',{
            id:"main-progress-holder",
            className:"span4",
            style:{
                margin:"30px 0"
            }
        }));
         
         
         form=this.create_el('form',{
            // enctype:'multipart/form-data',
           // method:'post',
             'data-test':'form',
             className:'hide-opera',
           /*  style:{
                // 'display':'none'
             }*/
         });
         form.appendChild(this.create_el('input',{
             accept:'image/*',
             type:'file',
             name:'filetoupload',
             multiple:'multiple',
             id:'fileToUpload',
             onchange:function(){
                that.onchange(this);
             }
         }));
         main.appendChild(form);
         
        
      },
   
     
     
     
     
     
     get_images_names:function(){
         this.update_list()
         var sortable=this.by_id('sortable'),
                 i,
                 childs=sortable.children, 
                 data,
                 num=1;
                 
                 for(i=0;i<childs.length;i++){
                     data=childs[i].getAttribute('data-src');
                     if (data) {
                         this.by_id('slika_'+num).value=data.slice(data.lastIndexOf('/',15)+1)
                       //  ++num; 
                      }else{
                          this.by_id('slika_'+num).value="";
                          
                      }
                      ++num;
                 }
         return;
         
         
     },
     
     
     
     
     
     
     
     
     
     
     
     
 };

