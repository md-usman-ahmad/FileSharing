$("#SignupConfirm").on("click",function(){
    let firstname = $("#firstName").val()
    let lastname = $("#lastName").val()
    let age = $("#Age").val()
    let email = $("#email").val()
    let password = $("#password").val()

    axios({
        method : "POST",
        url : "http://localhost:8000/signup",
        data : {
           firstname,
           lastname,
           age,
           email,
           password
        }
    })
    .then(function(response){
        console.log(response)
        $("#signupSuccessMessage").html(response.data.message);
        window.open('http://localhost:8000/login','_parent')
        // window.location.replace("http://localhost:8000/login");  
    })
    .catch(function(error){
        console.log(error)
        $("#signupErrorMessage").html(error.response.data.message);
    })
})