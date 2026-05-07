import {useContext} from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ children, role }) => {
    // const userInfo = JSON.parse(localStorage.getItem('userInfo')||'null');
    const {userInfo} = useContext(AuthContext);
    if (!userInfo) {
        return <Navigate to="/" />;
    }
    if (userInfo.user.role !== role) {
        return <Navigate to="/" />;
    }
    return children;
}
export default ProtectedRoute;