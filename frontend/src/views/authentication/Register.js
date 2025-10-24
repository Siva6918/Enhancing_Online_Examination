import React, { useEffect } from 'react';
import { Grid, Box, Card, Typography, Stack, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import AuthRegister from './auth/AuthRegister';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useRegisterMutation } from './../../slices/usersApiSlice';
import { setCredentials } from './../../slices/authSlice';
import Loader from './Loader';
import AI from './AI.png'; // image in the same folder

const userValidationSchema = yup.object({
  name: yup.string().min(2).max(25).required('Please enter your name'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password should be minimum 6 characters').required('Password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Password must match')
    .required('Confirm Password is required'),
  role: yup.string().oneOf(['student', 'teacher'], 'Invalid role').required('Role is required'),
});

const initialUserValues = {
  name: '',
  email: '',
  password: '',
  confirm_password: '',
  role: 'student',
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate('/');
  }, [navigate, userInfo]);

  const formik = useFormik({
    initialValues: initialUserValues,
    validationSchema: userValidationSchema,
    onSubmit: async (values) => handleSubmit(values),
  });

  const handleSubmit = async ({ name, email, password, confirm_password, role }) => {
    if (password !== confirm_password) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await register({ name, email, password, role }).unwrap();
        dispatch(setCredentials({ ...res }));
        formik.resetForm();
        navigate('/auth/login');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <PageContainer title="Register" description="AI Exam Register Page">
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left Side - Register Form */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f7fa',
            p: 4,
          }}
        >
          <Card
            elevation={12}
            sx={{
              p: 5,
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: 450,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
              AI_Evalu8 Register
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#555', mb: 4 }}>
              Create your account to start secure online exams
            </Typography>

            <AuthRegister formik={formik} />

            <Stack direction="row" spacing={1} justifyContent="center" mt={4}>
              <Typography color="#555" variant="body1">
                Already have an Account?
              </Typography>
              <Link to="/auth/login" style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ background: '#1976d2', color: '#fff' }}>
                  Sign In
                </Button>
              </Link>
            </Stack>
            {isLoading && <Loader />}
          </Card>
        </Grid>

        {/* Right Side - Creative AI Design */}
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff',
            overflow: 'hidden',
          }}
        >
          {/* Decorative floating elements */}
          <Box
            sx={{
              position: 'absolute',
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)',
              borderRadius: '50%',
              top: 50,
              left: 100,
              animation: 'floatLeft 12s ease-in-out infinite alternate',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 150,
              height: 150,
              background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)',
              borderRadius: '50%',
              bottom: 50,
              right: 120,
              animation: 'floatLeft 10s ease-in-out infinite alternate-reverse',
            }}
          />

          {/* Core creative content */}
          <Box sx={{ zIndex: 2, textAlign: 'center', maxWidth: 500 }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, mb: 2, textShadow: '2px 2px 15px rgba(0,0,0,0.4)' }}
            >
              Welcome to AI_Evalu8
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 400, mb: 4 }}>
              Take online exams securely with AI monitoring and instant evaluations.
            </Typography>

            {/* AI illustration */}
            <Box
              component="img"
              src={AI}
              alt="AI Illustration"
              sx={{
                width: '100%',
                maxWidth: 350,
                borderRadius: 3,
                boxShadow: '0 0 30px rgba(0,0,0,0.3)',
              }}
            />
          </Box>
        </Grid>

        {/* Animations */}
        <style>
          {`
            @keyframes floatLeft {
              0% { transform: translateY(0) translateX(0); }
              50% { transform: translateY(-25px) translateX(20px); }
              100% { transform: translateY(0) translateX(0); }
            }
          `}
        </style>
      </Grid>
    </PageContainer>
  );
};

export default Register;
