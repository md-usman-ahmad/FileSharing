let usfp2 = "";
function uploadFile(event) {
    event.preventDefault();
    console.log(event)
    console.log("event.target.imageFile.files = ",event.target.imageFile.files);
    const files = event.target.imageFile.files;
    console.log("files[0] = ",files[0]);
    const formData = new FormData();
    // formData.append('filename',file)

    /*  Bad Code for n number of files(keeping diffrent key of each file,access krna || code likhna jhanjhatthoga) 
     formData.append('foo',files[0]);
    formData.append('goo',files[1]);
    formData.append('hoo',files[2]);  */

    /*   Good Code for n number of files (use Loop, keeping key same of each file,.append hai to array me hi append hoga i.e array of objects bnega ,access krna || code likhna asaanhoga)
    for (let i = 0; i < files.length; i++) {
        formData.append('foo', files[i]);
    }    */

    //sirf ek file bhejrhe to best use-case
    formData.append('foo',files[0]);
    console.log("formData after appending = ",...formData);

    axios({
        method: "POST",
        url: "http://localhost:8000/upload",
        // headers: {
        //     'Content-Type': 'multipart/form-data'
        // },
        data: formData
    }).then(function (response) {
        // let uploadedServerFilePath = response.data;
        // console.log("typeof uploadedServerFilePath, uploadedServerFilePath = ",typeof uploadedServerFilePath,uploadedServerFilePath);
        // usfp2 = uploadedServerFilePath.split("=");
        // console.log("usfp2 = ",usfp2);
        console.log("response.data = ",response.data);
        $("#anchortag").html(response.data.downloadUrl);
        $("#downloadbtn").attr("href",response.data.downloadUrl);
        $("#anchortag").addClass("form-control");
        alert("File uploaded into database && documents-table(2nd)")
        location.reload();
    })
    .catch(function(error){
        console.log("error = ",error);
        alert(error.response.data);
    })
}

// NOTWORKING 
// $(".downloadbtn").on("click",function(){
//     try {
//         if($("#anchortag").text().trim().length === 0){
//             alert("there is no link to download right now");
//         } else{
//             axios({
//                 method: "GET",
//                 url: "http://localhost:8000/download",
//                 params : {
//                     fileName : usfp2[1]
//                 }   
//             })
//             .then(function (response) {
//                 console.log("response = ",response)
//                 alert("downloaded");
//                 // $("#anchortag").html(response.data);
//                 // $("#anchortag").addClass("form-control");
//             })
//         }
//     } catch (error) {
//         console.error("Failed to copy to clipboard:", error);
//     }
// })

                    // WAY-1 using clickevent 
$(".copylinkbtn").on("click", async function () {
  try {
    if ($("#anchortag").text().trim().length === 0) {
      alert("There is no link to copy right now");
    } else {
      await navigator.clipboard.writeText($("#anchortag").text() );
      alert("Text copied to clipboard!");
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
  }
});

                  // WAY - 2 Method of Calling functions from html/ejs file
// async function copyIt(){
//     try {
//         if($("#anchortag").text().trim().length === 0){
//             alert("there is no link to copy right now");
//         } else{
//             await navigator.clipboard.writeText( $("#anchortag").text() );
//             alert("Text copied to clipboard!");
//         }
//     } catch (error) {
//         console.error("Failed to copy to clipboard:", error);
//     }
// }

                        



// copying the innerContent using jquery
// let html = $("#anchortag").html(); //<i></i> or <span></span> or <b></b> etc will also get fetched along with text
// let text = $("#anchortag").text(); //only fetches text
// console.log(" .html() = ",html)
// console.log(" length of string[.html()]  = ",html.trim().length)
// console.log(" .text() = ",text)
// console.log(" length of string[.text()] = ",text.trim().length)

