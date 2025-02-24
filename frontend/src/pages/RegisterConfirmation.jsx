import ConfirmationScreen from '../components/ConfirmationScreen';

const RegisterConfirmation = () => {
    return (
        <ConfirmationScreen
            title="Registration Successful!"
            message="Your account has been successfully created. Please check your email for your API key. You will be redirected to the login page shortly."
            redirectPath="/login"
        />
    );
};

export default RegisterConfirmation;