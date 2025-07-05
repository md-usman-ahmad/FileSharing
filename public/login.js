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