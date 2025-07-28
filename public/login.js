const toastLiveExample = document.getElementById('liveToast')
const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)


$("#loginConfirm").on("click",function(e){
    e.preventDefault();
    let em = $("#loginEmail").val();
    let pass = $("#loginPassword").val();
    console.log(em);
    console.log(pass);

    axios({
        url: "http://localhost:8000/login",
        method: "POST",
        data: {
          email : em,
          password: pass
        }
    })
    .then(function(response){
        console.log(response);
        $("#loginSuccessMessage").html(response.data.message);
        window.location.replace("http://localhost:8000/home");
    })
    .catch(function(error){
        console.log(error);
        $("#loginErrorMessage").html(error.response.data.message);
    })
})

$(".newPasswordConfirm").on("click",function(){
    let email = $("#email").val();
    let newPassword = $("#enp").val();

    axios({
        method : "PATCH",
        url : "http://localhost:8000/forgotpassword",
        data : {
            email,
            newPassword
        }
    })
    .then(function(response){
        console.log("response =",response);
        $("#enpSuccessMessage").html(response.data+" refreshing the page in 3 seconds");
        $(".main").html(response.data + " refreshing the page in 3 seconds");
        toastBootstrap.show();
        setTimeout(function(){
            location.reload();
        },3000);
    })
    .catch(function(error){
        console.log("error =",error);
    })
})