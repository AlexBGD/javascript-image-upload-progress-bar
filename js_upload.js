
 try {
    var xhr = new XMLHttpRequest();

    if ('onprogress' in xhr) {
        // Browser supports W3C Progress Events
    } else {
        // Browser does not support W3C Progress Events
    }
} catch (e) {
    // Browser is IE6 or 7
}
 
 
 
 
 
 
 
 var upload_progress={
     
     max_filesize_MB:10,
     server_script:'http://nadjinekretnine.com/ostavi-oglas/upload',
     extension:['jpg','png','jpeg'],
     images_num:0,
     progress_holder:'main-progress-holder',
     errors:[],
     ids:[1,2,3,4,5,6,7,8,9,10],
     zauzeti_ids:[],
     
     
     get_free_positions:function(){
         var that=this,
                 arr=this.ids.filter(function(i){
           return that.zauzeti_ids.indexOf(i)<0;
       });
       if (arr.length>10) {
    throw 'ZAUZETIH POLJA IMA VISE OD DESET!';
}
return arr;
     },
     
     
     validation:function(files){
         if (!Array.isArray(this.extension)) {
             throw 'EXTENSION MUST BE ARRAY FORMAT! EXAMPLE:this.extension=["jpg","png"]';
         }
         var images=[],
                 i,x,
                 files_length=files.length,
                 ext_leng=this.extension.length,
                 ext=this.extension;
         
         
         
         for(i=0;i<files_length;i++){
                 if (this.validation_type(files[i])&&this.validation_size(files[i])) {
                        images.push(files[i])
                  }
         }
 
         
         
        
         return images;
         
         
         
     },
     
      validation_type:function(file){ return true;
             if (!('name' in file)) {
                 throw "FILE NAME IS NOT SET!";
             }  
             var ext=file.name.slice(file.name.lastIndexOf('.')+1).toLowerCase(); 
             if (this.extension.indexOf(ext)>-1) {
                    return true;
             }
             this.errors.push('Dozvoljene extenzije su: '+this.extension.toString())
              return false;
     },
     
    validation_size:function(file){ return true;
         if (this.max_filesize_MB==-1) {
             console.log('Image validation size is not definaid!');
            return true;
         }else if(!('size' in file)){
             throw 'SIZE IS NOT DEFINAID!';
         }
        // console.log(parseFloat(this.file_to_MB(file.size)))
         if (parseFloat(this.file_to_MB(file.size))>this.max_filesize_MB) {
             this.errors.push('Maximalna velicina file je: '+this.max_filesize_MB+" MB")
             return false;
         }
         return true;
         
         
         
    },
     
     
     
     
     
     
     
     onchange:function(el){
        
     
        this.upload(el.files);
      
 
     },
     upload:function(file) {
         
         
         
         var free_img=10-this.images_num,
                 i;
         if (free_img===0) {
            throw 'NEMA VISE SLOBODNIH MESTA!';
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
          // console.log(file);
           
       
       
      
         
      
         var that=this,
                 id,
                 fd,
                 xhr=new XMLHttpRequest();
         
      
    
      
         for(i=0;i<file.length;i++){
           
             ++this.images_num;
             xhr = new XMLHttpRequest();
             this.create_progress(file[i].name,file[i].size,this.images_num,xhr);
             
             fd = new FormData();
             fd.append("imageHTML5",file[i]);
             fd.append("imageHTML5_id",this.images_num);
             
             /**
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
                   // console.log(e.target.responseText);
                    var data=JSON.parse(e.target.responseText);
                          that.show_image(data);
                         // that.remove_progress_bar(data.id);
                 }, false);
                 xhr.addEventListener("error", function(e){
                            console.log('error',e);
                        
                            that.remove_progress_bar(id);
                 }, false);
                 xhr.addEventListener("abort", function(e){
                           console.log('abort',e)
                           that.remove_progress_bar(id);
                 }, false);
                 xhr.open("POST", that.server_script,true);
                 xhr.send(fd);
             
             
            
             
             
         }
         // console.log(clone_free);
       
      this.update_list();
      },
      
      
      
      by_data_attr:function(id){
         var sortable=this.by_id('sortable'),
                 i,
                 childs=sortable.children;
         for(i=0;childs.length;i++){
             
             if (childs[i].getAttribute("data-id")==id) {
                 return childs[i]
}
         }
         
         return false;
         
      },
      

      
      
      by_id:function(id){
        return document.getElementById(id);  
      },
      remove_progress_bar:function(progress_id){ 
          var that=this;
          
          this.jquery_animate('progress-hodler-id_'+progress_id)
          
     /*   setTimeout(function(){
             that.by_id(that.progress_holder).removeChild(that.by_id('progress-hodler-id_'+progress_id));
        },1000);*/
      },

        show_image:function(data){
           // data=JSON.parse(data);
            var el=this.by_data_attr(data.id)/*el=document.getElementById('image'+data.id)*/,
                    img=document.createElement('img'),
                    a=document.createElement('a'),
                    that=this,
                    del;
            if (!el) {
    throw 'CANNOT FIND ELEMENT BY DATA ATTRIBUTE!'
}
            img.src=data.img;
            img.style['max-height']="80px";
            el.className="ui-state-default";
            a.href="#";
            a.onclick=function(e){
                e.preventDefault();
                that.postavi_kao_glavnu(el);
                return false;
            };
             a.innerHTML='Postavi kao glavnu';
             del=this.create_el('a',{
                href:"#",
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
                             
                             that.images_num--;
                             that.update_list();
                    return false;
                }
             });
            del.appendChild(this.create_el('i',{
                className:"fa fa-times",
                title:'Obrisi sliku',
                style:{
                    'position':'absolute',
                    'top':'-2px',
                    right:'-2px',
                    'font-size':'15px',
                    color:'red',
                   'background-color':'white'
                }
            }))
            el.appendChild(del)
            el.appendChild(img);
            el.appendChild(a);
            this.update_list();
        },
        
        
        swapNodes:function(node1, node2) {
           // console.log(node1,node2);
   var node2_copy = node2.cloneNode(true);
    node1.parentNode.insertBefore(node2_copy, node1);
    node2.parentNode.insertBefore(node1, node2);
    node2.parentNode.replaceChild(node2, node2_copy);
},




        /**
         * 
         * @returns {Boolean}
         * 
         * 
         * replace sapan and A tags and their text
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
          var el=document.createElement(el);      
             for(var i in attr){
                 if (i=='style') {
                     for(var x in attr[i]){
                          el[i][x]=attr[i][x];
                          continue;
                     }
                 }
                 el[i]=attr[i]
             }
             return el;
    },
        
        
        

        
        postavi_kao_glavnu:function(el){ 
            this.swapNodes(this.by_id('sortable').firstElementChild,el);
             this.update_list(); 
            return false;
        },
        
        
        remove_image_from_list:function(id){
            
            
            
            
            
        },
      
      
      create_progress:function(filename,filesize,id,xhr){
          filename=filename.length>6?filename.substr(0,4)+"..."+filename.substr(-3):filename;
          filesize=this.file_to_MB(filesize)+" MB"
          
          
          
          
          
          var holder=document.createElement('div');
          holder.className='progress-holder custom_progress-holder';
          holder.id='progress-hodler-id_'+id;
          var name=document.createElement('span');
          name.className="pull-left";
          name.id='file_name_'+id;
          name.innerHTML=filename;
          holder.appendChild(name);
          var size=document.createElement('span');
          size.className="pull-right";
          size.id='file_size_'+id;
          size.innerHTML=filesize
          holder.appendChild(size);
          
          
          var clearx=document.createElement('div');
          clearx.className='clearfix';
          holder.appendChild(clearx);
          
          var progress=document.createElement('div');
          progress.className='progress progress-success progress-striped';
          progress.style['margin-bottom']='0';
          var bar=document.createElement('div');
          bar.className='bar';
          bar.id='progress_bar_'+id;
          bar.style['margin-bottom']='0';
          progress.appendChild(bar);
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
          document.getElementById(this.progress_holder).appendChild(holder);
          
      },
      
        chosse_images:function(){
         $("#fileToUpload").click()
     },
     
     
     
     
     
     
     
     file_to_MB:function(size){
        return (Math.round(size * 100 / (1024 * 1024)) / 100)
     },
     validate_file_size:function(size){
         if (size>this.max_filesize_MB) {
             console.log('file is NOT valide');
         }else{
             console.log('file size is valiid')
         }
     },
      
      
      
      jquery_animate:function(id){
          
           $( "#"+id ).hide( 'highlight', {}, 2000, setTimeout(function() {
        $( "#"+id ).remove();
      }, 2000 ) );
          
          
          
          
    }
      
      
      
      
      
      
      
      
      
     
 };
