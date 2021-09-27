import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButton, IonInput, IonButtons, IonBackButton, IonLoading, IonMenuButton, IonIcon, IonLabel, } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Input from "../../components/Input";
import { object, string } from "yup";
import './Page.css';
import { accountService } from '../../services/accountService'; 
import { useHistory, useLocation } from "react-router-dom";
import { GoogleLogin } from "react-google-login";
import GoogleButton from 'react-google-button';
import { config } from "../../helpers/config";
import { useAuth } from '../../AuthContext'; 
import useResolver from "../../helpers/resolver";
import Header from '../../components/Header';
import "@codetrix-studio/capacitor-google-auth";
import { Plugins } from '@capacitor/core';
import { usePlatform } from "@capacitor-community/react-hooks/platform/usePlatform";
import { logoApple } from "ionicons/icons";

const LoginCapacitor: React.FC = () => {

  const history = useHistory();
  const location = useLocation();
  const [error, setError] = useState("");
  const [showLoading, setShowLoading] = useState<any>(false);
  const { logIn } = useAuth();
  const { platform } = usePlatform();

  const validationSchema = object().shape({
      email: string().required(),
      password: string().required(),
  });
  
  const { control, handleSubmit, errors }:any = useForm({
    resolver: useResolver(validationSchema),
  });

  useEffect(() => { Plugins.GoogleAuth.init();},[])

  const login = (data: any) => {
    setError("");
    console.log(data);
    setShowLoading(true);
    
    accountService.login(data.email, data.password)
    .then((user) => loginFn(user))
    .catch(error => { setError(error); setShowLoading(false); });
  };

  const signIn = async () =>  {

    const result = await Plugins.GoogleAuth.signIn();
    if (result) {

      setShowLoading(true);
      accountService.googleLogin({ token: result.authentication.idToken })
      .then((user) => loginFn(user))
      .catch(error => { setError(error); setShowLoading(false); });
    } 
  };
  
  const signInApple = async () =>  {

      const { SignInWithApple } = Plugins;

      SignInWithApple.Authorize()
      .then(async (res:any) => {
        if (res.response && res.response.identityToken) {
          console.log("Response: ",res);
          setShowLoading(true);
           accountService.appleLogin({ token: res.response.identityToken, clientId: "com.cliqclin.app" })
           .then((user) => loginFn(user))
           .catch(error => { setError(error); setShowLoading(false); });
           //  .then((user) => console.log("User: ",user))
          setShowLoading(false);
        } else console.log("Error fetching response");

      }).catch( () => setShowLoading(false));
  };

  const loginFn = (user:any) => {

    logIn(user);
    let strLocation = '';

    if( user && user.role == "User" ) strLocation = '/home';
    else if(user && user.role === "Tutor" ) history.push("/tutor");
    history.push(strLocation);
  }

  return (
    <IonPage>

      <Header name="Sign In" />

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar color={ ( platform === 'ios' ) ? config.themeColor : "" } >
            <IonTitle size="large">Sign In</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <div className="ion-padding">
          { platform === 'ios' && (
            <IonButton expand="block" color="light" onClick={signInApple}>
              <IonIcon slot="start" color="dark" ios={logoApple} /><IonLabel>Sign In with Apple </IonLabel>
            </IonButton>
          )}

          <GoogleButton                   
            label="Sign In with Google"
            style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }} 
            onClick={signIn}
          />

          { error && (<p style={{ textAlign: "center", color: "red"}} >{error}</p>) }

          <form onSubmit={handleSubmit(login)}>           
            <Input name="email" label="Email" control={control} errors={errors} type="email" 
            placeholder="john@doe.com" />
            
            <Input name="password" label="Password" control={control} errors={errors} 
            type="password" />

            <IonButton color={config.buttonColor} expand="block"  type="submit" className="ion-margin-top">
              Submit
            </IonButton>
          </form>

          <IonLoading
              cssClass='my-custom-class'
              isOpen={showLoading}
              onDidDismiss={() => setShowLoading(false)}
              spinner={'bubbles'}
              message={'Please wait...'}
              duration={5000}
          />

          <IonButton routerLink="/register" color="secondary" expand="block" className="ion-margin-top">
            SIGN UP
          </IonButton>

          </div>
      </IonContent>

    </IonPage>
  );
};

export default LoginCapacitor;
