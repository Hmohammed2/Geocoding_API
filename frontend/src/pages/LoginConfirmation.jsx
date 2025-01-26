import ConfirmationScreen from '../components/ConfirmationScreen';
import { useAuth } from '../components/contexts/AuthContext';

const LoginConfirmation = () => {
    const { user } = useAuth();

    return (
        <ConfirmationScreen
            title={`Login Successful! Welcome ${user?.userName}`}
            message="You will be redirected to your profile shortly."
            redirectPath="/profile"
        />
    );
};

export default LoginConfirmation;
