import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useGoogleLogin } from "@react-oauth/google";
import Loader from "../components/Loader";
import {
  useRegisterMutation,
  useGoogleLoginMutation,
} from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googleLogin] = useGoogleLoginMutation();
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const handleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log(decoded);
    const googleName = decoded.name;
    const googleEmail = decoded.email;

    const responseFromApiCall = await googleLogin({
      googleName,
      googleEmail,
    }).unwrap();
    dispatch(setCredentials({ ...responseFromApiCall }));
    navigate("/");
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await register({ name, email, password }).unwrap();
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const googleSignin = useGoogleLogin({
    onSuccess: (response) => {
      handleSuccess(response);
    },
    onError: () => {
      console.log("Login Failed");
    },
  });

  return (
    <Container>
      <Row className="justify-content-md-center mt-5 mb-3">
        <Col xs={12} md={4} style={{ paddingLeft: "0" }}>
          <h1 className="text-start login-title">Signup</h1>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col xs={12} md={4} className="card p-4 login-card">
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Control
                type="text"
                placeholder="Enter Name"
                value={name}
                style={{ border: "1px solid ", borderRadius: "0px" }}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Control
                type="email"
                placeholder="Enter Email"
                value={email}
                style={{ border: "1px solid ", borderRadius: "0px" }}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Control
                type="password"
                placeholder="Enter Password"
                value={password}
                style={{ border: "1px solid ", borderRadius: "0px" }}
                onChange={(e) => setPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                style={{ border: "1px solid ", borderRadius: "0px" }}
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            {isLoading && <Loader />}

            <Button
              type="submit"
              variant="primary"
              className="mt-3"
              style={{ width: "100%" }}
            >
              Sign Up
            </Button>

            <Row className="py-3 justify-content-center">
              <Col className="text-center" style={{ fontWeight: "500" }}>
                Already have an account? <Link to="/login">Login</Link>
              </Col>
            </Row>
          </Form>
          <div
            className="text-center mb-2"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <button
              onClick={() => googleSignin()}
              className="btn btn-primary"
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                fontSize: "16px",
              }}
            >
              Signup with<span style={{ fontWeight: "600" }}> Google</span>
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterScreen;
