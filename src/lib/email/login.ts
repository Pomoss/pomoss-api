import { VerifyArgs } from "../hotp"
const getLoginEmailHtml = ({email, token}: VerifyArgs) => {
    const loginUrl = `${process.env.BACKEND_URL}/auth/hotp/verify?email=${email}&token=${token}`
    return`
<!DOCTYPE html>
<html lang="en">

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">
</head>

<body style="text-align: center;">
    <h1 class="pln"><strong>Welcome to Pomoss.css!!</strong></h1>
    <p>Enter 6 digits password to finish login</p>
    <h3>${token}</h3>
    <a class="button" href=${loginUrl}><span class="pln">Login</span></a>
    <p style="margin-top: 50px;">You can also login with below URL</p>
    <a href=${loginUrl}>${loginUrl}</a>
</body>

</html>
`
}

export default getLoginEmailHtml