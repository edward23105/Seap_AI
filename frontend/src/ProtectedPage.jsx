import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getLoggedStatus } from "./api";

export default function ProtectedRoute({ children }){
	const [islogged, setIsLogged] = useState(null);

	useEffect(() => {
		(async ()=> {
		const status = await getLoggedStatus();
		setIsLogged(status);
		})();// echiv la self calling : (func)();
	}
	,[])

	if(islogged == null) return <div> Loading.... </div>; // we wait to see if its logged or not

	return islogged ? children : <Navigate to="/login" replace />; 
}
