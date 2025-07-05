
$("#logoutbtn").on("click", function (event) {
    event.preventDefault();
    axios({
        method: "POST",
        url: "http://localhost:8000/logout"
    })
        .then(function (response) {
            alert(response.data.message);
            location.reload();
        })
})

let sendfileid = 0;
$(".sendBtn").on("click",function(event){
    console.log("event = ",event);
    console.log("event.currentTarget.id = ",event.currentTarget.id);
    let id = event.currentTarget.id.split("-")[1];
    sendfileid = id;
    console.log("sendfileid = ",sendfileid);

    axios({
        url : "http://localhost:8000/allUsersInModal",
        method : "GET",
    })
    .then(function(response){
        console.log("response.data = ",response.data);
         let arr = response.data;
            $("#divs").remove();
            let htmlstr = "<div> ";
            arr.forEach(function(item){
                htmlstr += `        
                <div class="d-flex " >  
                    <p>${item.email}</p>
                    <img src="add.png" alt="" width="30px" height="30px" id=${item.userid} class="ms-auto plus">
                </div>
                `
            })
            htmlstr += '</div>';
            $(".modal-body").append(htmlstr);
    })
    .catch(function(error){

    })
})

// Event delegation me hum ek aise element pe event listener lagate hain jo pehle se DOM me exist karta hai (jaise .modal-body), fir wo sabhi aane wale dynamic elements ke liye bhi event ko handle kar leta hai.
$(".modal-body").on("click", ".plus", function(event) {
    console.log(".plus event = ",event)
    console.log("event.currentTarget.id = ",event.currentTarget.id);
    let receiverUserId = event.currentTarget.id;
    axios({
        method : "POST",
        url : "http://localhost:8000/sendfile",
        data : {
            receiverUserId,
            sendfileid
        }       
    })
    .then(function(response){
        console.log("response = ",response);
    })
    .catch(function(error){
        console.log("error = ",error);
    })
})

$("#filesSentbtn").on("click",function(){
    window.open('http://localhost:8000/filesSent','_parent')
})
$("#filesReceivedbtn").on("click",function(){
    window.open("http://localhost:8000/filesReceived" , "_parent");
})


                                            // DELETETASK CODE 
// method - 1
$(".deleteBtn").on("click",function(event){
    console.log("event = ",event);
    console.log("event.currentTarget.id = ",event.currentTarget.id);
    let docid = event.currentTarget.id.split("-")[1];
    console.log("docid = ",docid);
    axios({
        url : "http://localhost:8000/deletefile",
        method : "DELETE",
        data : {
            docid
        }
    })
    .then(function(response){
        console.log("response : ",response)
        console.log("response.data : ",response.data);
        location.reload();
    })
    .catch(function(error){
        console.log("error : ",error);
        // console.log("error.response.data = ",error.response.data);
    })  

})
// method - 2 (notGood)
    // function deleteTask(id){
    //     console.log("id of deletingItem = ",id);
    //     axios({
    //         url : "http://localhost:8000/deleteTask",
    //         method : "DELETE",
    //         data : {
    //             id : id
    //         }
    //     })
    //     .then(function(response){
    //         console.log("response : ",response)
    //         console.log("response.data : ",response.data);
    //         location.reload();
    //     })
    //     .catch(function(error){
    //         console.log("error : ",error);
    //         // console.log("error.response.data = ",error.response.data);
    //     })
    // }

