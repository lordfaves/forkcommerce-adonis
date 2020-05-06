const Event = use('Event')
const Mail = use('Mail')

Event.on('paystack-payment::received', async (payment, user, admin) => {
  await Mail.send('emails.paystack-payment-received-client', {payment, user, admin}, (message) => {
    message.to(user.email)
    message.from('cs@forkcommerce.com')
    message.subject('Payment was successfully received')

  })
  .then(()=>{
      
      console.log('success')
  })
  .catch((error)=>{
    console.log(error)

  })

  await Mail.send('emails.paystack-payment-received-admin', {payment, user, admin}, (message) => {
    message.to(admin.email)
    message.from('cs@forkcommerce.com')
    message.subject('Boom, someone paid via paystack')

  })
  .then(()=>{
      console.log('success')
  })
  .catch((error)=>{
    console.log(error)

  })

})

Event.on('bank-transfer-payment::approved', async (payment, user) => {
  await Mail.send('emails.bank-transfer-payment-approved-client', {payment, user}, (message) => {
    message.to(user.email)
    message.from('cs@forkcommerce.com')
    message.subject('Payment was approved.')

  })
  .then(()=>{
      
      console.log('success')
  })
  .catch((error)=>{
    console.log(error)

  })

})

