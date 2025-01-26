import ConfirmationScreen from '../components/ConfirmationScreen';

const PaymentConfirmation = () => {
    return (
        <ConfirmationScreen
            title="Payment Successful!"
            message="Thank you for your purchase. You will be redirected to your dashboard shortly."
            redirectPath="/profile"
        />
    );
};

export default PaymentConfirmation;
