import { IonButtons, useIonToast, IonFooter, IonToggle, IonLoading, IonIcon, IonButton, IonBackButton, IonList, IonLabel, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem } from '@ionic/react';
import { useParams } from 'react-router';
// import './Intro.scss';
import React, { useState, useEffect } from "react";
import { accountService } from '../../services/accountService'; 
import { useHistory } from "react-router-dom";
// import { config } from "../../helpers/config";
import { arrowBackOutline, arrowBackSharp} from 'ionicons/icons'; 
import { config } from '../../helpers/config';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token, } from '@capacitor/push-notifications';
import { usePlatform } from '@capacitor-community/react-hooks/platform';

const Settings : React.FC = () => {

  const { mode } = useParams<any>();
  const history = useHistory();
  const [showLoading, setShowLoading] = useState<any>(false);
  const [checked, setChecked] = useState(false);
  const user = accountService.userValue;
  const [error, setError] = useState("");
  const [present, dismiss] = useIonToast();
  const { platform } = usePlatform();

  useEffect(() => {
    console.log(user);
    const isToken = ( user && user.device_token ) ? true : false;
    setChecked(isToken);    

  }, []);

  const enableDisable = async (isEnabled: any) => {

    if( platform === 'android' || platform === 'ios' ) {

      setChecked(isEnabled);
      setShowLoading(true);     

      // if( isEnabled === false ) update({ device_token: "" });
      if( isEnabled == 0 ) update({ device_token: "" });

      else {

        // Request permission to use push notifications
        // iOS will prompt user and return if they granted permission or not
        // Android will just grant without prompting
        PushNotifications.requestPermissions().then(result => {
          if (result.receive === 'granted') {
            // Register with Apple / Google to receive push via APNS/FCM
            PushNotifications.register();
          } else {
            // Show some error
          }
        });

        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration',
          (token: Token) => {
            alert('Token Generated');
            console.log(token);
            update({ device_token: token.value });
          }
        );

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError',
          (error: any) => {
            alert('Error on registration: ' + JSON.stringify(error));
          }
        );

      }
    }

  };

  const update = (data: any) => {

    accountService.update( user.id, data)
      .then((user) => {
        console.log(user);
        setShowLoading(false);
        if( data.device_token !== "" ) present("Notification enabled Successfully! ", 2000);
        else present("Notification disabled Successfully! ", 2000);
        history.go(0);
      }).catch(error => {
        typeof null === 'object' ? console.error(error) : setError(error);
        setShowLoading(false);
      });
  }

  const logout = () => {
    const response:any = accountService.logout();
    if ( response === 'success' ) history.replace('/home');
    else response.then(() => history.replace('/home'));
  }

  const next = () => {
    if( mode === "registration") history.push("/supplier/product/create");
    if( mode === "user") history.push("/home");
  };

  return (
    <IonPage>
      <IonHeader color="primary">
        <IonToolbar color={ ( platform === 'android' || platform === 'web' ) ? config.themeColor : "" }>
          <IonButtons slot="start">
            <IonButton onClick={ () => history.goBack() } >
              <IonIcon slot="icon-only" ios={arrowBackOutline} md={arrowBackSharp} />
            </IonButton>
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar color={ ( platform === 'ios' ) ? config.themeColor : "" } >
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <div className="ion-padding">
          { error && (<p style={{ textAlign: "center", color: "red"}} >{error}</p>) }

          <IonItem lines="full">
            <IonLabel>Enable Notifications</IonLabel>
            <IonToggle slot="end" checked={checked} onIonChange={e => enableDisable(e.detail.checked)} />
          </IonItem>
        </div>

        <IonLoading
              cssClass='my-custom-class'
              isOpen={showLoading}
              onDidDismiss={() => setShowLoading(false)}
              spinner={'bubbles'}
              message={'Please wait...'}
              duration={5000}
          />

      </IonContent>

      <IonFooter>
        <IonToolbar>  
        { ( mode && mode === "registration" || mode === "user" ) ? (
          <IonButton onClick={next} disabled={ checked ? false : true } className="ion-margin-horizontal" color={config.buttonColor} expand="full" > NEXT </IonButton>
        ) : (
          <IonButton className="ion-margin-horizontal" color={config.buttonColor} expand="full" onClick={logout}> 
          LOGOUT </IonButton>
        )}
        </IonToolbar>
      </IonFooter>

    </IonPage>
  );
};

export default Settings;
