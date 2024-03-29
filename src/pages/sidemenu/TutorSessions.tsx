import { IonLoading, IonChip, IonList, IonLabel, IonSegment, IonSegmentButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonItem, IonAvatar } from '@ionic/react';
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { questionService } from '../../services/questionService';
import { accountService } from '../../services/accountService'; 
import SkeletonLoader from "../../components/SkeletonLoader";
import { config } from '../../helpers/config';
import Header from '../../components/Header';
import { usePlatform } from '@capacitor-community/react-hooks/platform/usePlatform';

const TutorSessions: React.FC = () => {

  const history = useHistory();
  const [questions, setQuestions] = useState<any>([]);
  const [scheduled, setScheduled] = useState<any>([]);
  const [complete, setComplete] = useState<any>([]);
  const [segment, setSegment] = useState('all');
  const [showLoading, setShowLoading] = useState<any>(false);
  const [showAllLoading, setShowAllLoading] = useState<any>(true);
  const [showScheduledLoading, setShowScheduledLoading] = useState<any>(true);
  const [showCompleteLoading, setShowCompleteLoading] = useState<any>(true);
  const { platform } = usePlatform();

  const [user, setUser] = useState();
  
  const loaderOff = () => {
    setShowLoading(false);
    setShowLoading(false);
    setShowAllLoading(false);
    setShowScheduledLoading(false);
    setShowCompleteLoading(false);
  };

  useEffect(() => {
    const user = accountService.userValue;
    setUser(user);
    setShowLoading(true);

    console.log(user);
    questionService.getByTutorId(user.tutor_id)
    .then( questions => {
        let allList:any = [];
        let scheduleList:any = [];
        let completeList:any = [];
        console.log(questions);

        questions.forEach( (question:any) => {
          if( question.status === "Paid" || question.status === "Complete" ) allList.push(question);
          if( question.status === "Paid" ) scheduleList.push(question);
          else if( question.status === "Complete" ) completeList.push(question);
        })

        setQuestions(allList); 
        setScheduled(scheduleList);
        setComplete(completeList);
        loaderOff();

    }).catch( error => {
        console.log(error);
        loaderOff();
    });

  }, []);

  return (
    <IonPage>

      <Header name="Tutor Sessions" user={user} />

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar color={ ( platform === 'ios' ) ? config.themeColor : "" } >
            <IonTitle size="large">Tutor Sessions</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="">

        <IonToolbar color={config.themeColor}>
          <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as any)}>
              {/* <IonBadge color="primary"></IonBadge> */}
              <IonSegmentButton value="all"> 
                { (segment === "all") ? 
                  (<IonChip><IonLabel>ALL ({questions.length})</IonLabel></IonChip>) : 
                  (<IonLabel  >ALL ({questions.length})</IonLabel>) 
                }
              </IonSegmentButton>
              <IonSegmentButton value="scheduled">
                { (segment === "scheduled") ? 
                  (<IonChip> <IonLabel>SCHEDULED ({scheduled.length})</IonLabel></IonChip>)  : 
                  (<IonLabel  >SCHEDULED ({scheduled.length})</IonLabel>) 
                }                
              </IonSegmentButton>
              <IonSegmentButton value="complete">
                { (segment === "complete") ? 
                  (<IonChip> <IonLabel> COMPLETE ({complete.length})</IonLabel> </IonChip>)  : 
                  (<IonLabel> COMPLETE ({complete.length})</IonLabel>) 
                }
              </IonSegmentButton> 
            </IonSegment>
          </IonToolbar>
          
          <IonList style={ segment === 'all' ?  {} : { display: 'none' }}>
            { 
              questions.length > 0 && ( 
                questions.map( (question: any) =>  (
                  // onClick={ (e) => { history.push(`/question/${question.id}`, question ) }}  
                  // Or this
                  // routerLink={`/session/${question.id}`}
                  <IonItem detail key={question.id} onClick={ (e) => { history.push(`/tutor/session/${question.id}`, question ) }}  >
                    <IonAvatar slot="start">
                      <img src={`${config.userIcon}`}  alt="Speaker profile pic" />
                      {/* <img src={ user.profile_picture ? 
                      `${config.apiUrl}/files/image/${user.profile_picture}` : `${process.env.PUBLIC_URL}/img/avatar.png`
                      }  alt="Speaker profile pic" /> */}                
                    </IonAvatar>
                    <IonLabel>
                      <h2>{question.title}</h2>
                      <h6 style={{ opacity: ".5" }}>{question.date_time} ({question.no_of_hours} HRS)</h6>
                    </IonLabel>
                  </IonItem>
                ))
              ) 
            }
            { !showAllLoading && !questions.length && (<IonItem>No item Available</IonItem>)}
            {showAllLoading && (<SkeletonLoader />) }
          </IonList>

          <IonList style={ segment === 'scheduled' ?  {} : { display: 'none' }}>
            { 
              scheduled.length > 0 && ( 
                scheduled.map( (question: any) =>  (
                  // onClick={ (e) => { history.push(`/question/${question.id}`, question ) }}  
                  // Or this
                  // routerLink={`/question/${question.id}`}
                  <IonItem detail key={question.id} onClick={ (e) => { history.push(`/session/${question.id}`, question ) }}  >
                    <IonAvatar slot="start">
                      <img src={`${config.userIcon}`}  alt="Speaker profile pic" />
                      {/* <img src={ user.profile_picture ? 
                      `${config.apiUrl}/files/image/${user.profile_picture}` : `${process.env.PUBLIC_URL}/img/avatar.png`
                      }  alt="Speaker profile pic" /> */}                
                    </IonAvatar>
                    <IonLabel>
                      <h2>{question.title}</h2>
                      <h6 style={{ opacity: ".5" }}>{question.date_time} ({question.no_of_hours} HRS)</h6>
                    </IonLabel>
                  </IonItem>
                ))
              ) 
            }
            { !showScheduledLoading && !scheduled.length && (<IonItem>No item Available</IonItem>)}
            {showScheduledLoading && (<SkeletonLoader />) }
          </IonList>

          <IonList style={ segment === 'complete' ?  {} : { display: 'none' }}>
            { 
              complete.length > 0 && ( 
                complete.map( (question: any) =>  (
                  // onClick={ (e) => { history.push(`/question/${question.id}`, question ) }}  
                  // Or this
                  // routerLink={`/question/${question.id}`}
                  <IonItem detail key={question.id} onClick={ (e) => { history.push(`/session/${question.id}`, question ) }}  >
                    <IonAvatar slot="start">
                      <img src={`${config.userIcon}`}  alt="Speaker profile pic" />
                      {/* <img src={ user.profile_picture ? 
                      `${config.apiUrl}/files/image/${user.profile_picture}` : `${process.env.PUBLIC_URL}/img/avatar.png`
                      }  alt="Speaker profile pic" /> */}                
                    </IonAvatar>
                    <IonLabel>
                      <h2>{question.title}</h2>
                      <h6 style={{ opacity: ".5" }}>{question.date_time} ({question.no_of_hours} HRS)</h6>
                    </IonLabel>
                  </IonItem>
                ))
              ) 
            }
            { !showCompleteLoading && !complete.length && (<IonItem>No item Available</IonItem>)}
            {showCompleteLoading && (<SkeletonLoader />) }
          </IonList>

          <IonLoading
              cssClass='my-custom-class'
              isOpen={showLoading}
              onDidDismiss={() => setShowLoading(false)}
              spinner={'bubbles'}
              message={'Please wait...'}
              duration={5000}
          />
          
        </div>

      </IonContent>
    </IonPage>
  );
};

export default TutorSessions;
