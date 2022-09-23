import { configure } from 'mobx';
import { RouterStore } from 'mobx-react-router';
import 'mobx-react/batchingForReactDom';
import React from 'react';
import { ActivityLog } from './activityLog';
import { Analytics } from './analytics';
import { AppointmentReminder } from './appointmentReminder';
import { Appointment } from './appointments';
import { Authentication } from './authentication';
import { CallForwarding } from './callForwarding';
import { Category } from './category';
import { Chat } from './chats';
import { Contacts } from './contacts';
import { Dialer } from './dialer.pbx.utils.js';
import { Fax } from './fax';
import { FormGroups } from './formGroup';
import { FormInitiation } from './formInitiation';
import { HardwarePhone } from './hardwarePhone';
import { HardwarePhones } from './hardwarePhones';
import { HygieneReminder } from './hygieneReminder';
import { IncomingCall } from './incomingCall';
import { IncomingCalls } from './incomingCalls';
import { Lobby } from './lobby';
import { MobileNotificationSettings } from './mobileNotificationSettings';
// import { Task } from "./task.store.js";
import { Notification } from './notification';
import { OfficeChat } from './officeChats';
import { OfficeProfile } from './officeProfile';
import { OnlineSchedule } from './onlineSchedule';
import { OnlineScheduleSettings } from './onlineScheduleSettings';
import { PaperlessForm } from './paperlessForm';
import { Patient } from './patient';
import { PatientChat } from './patientChats';
import { PatientData } from './patientData';
import { PatientFeed } from './patientFeed';
import { PatientFile } from './patientFile';
import { PatientForm } from './patientForm';
import { PhoneFaxAwayGreeting } from './phoneFaxAwayGreeting';
import { HoldMusicGreeting } from './holdMusicGreeting';
import { PhoneFaxOptions } from './phoneFaxOptions';
import { CustomGreetings } from './customGreetings';
import { PhoneFaxSchedule } from './phoneFaxSchedule';
import { Practitioners } from './practitioners';
import { Room } from './rooms';
import { Scheduling } from './scheduling';
import { Task } from './tasks';
import { Trigger } from './trigger';
import { Users } from './users';
import { Utils } from './utils';
import { IvrSettings } from './ivrSettings';
import { CreateIvr } from './createIvr';
import { PurchaseNumber } from './purchaseNumber';
import { Permissions } from './permissions';
import { Reminders } from './reminders';
import { Integrations } from './integrations';
import { AutomationSettings } from './automationSettings';
import { NotificationSettings } from './NotificationSettings';
import { PaperlessAutomation } from './paperlessAutomation';
import { LocalServerApp } from './lsa';
import { KittyOfficeChat } from './chatkitty';
import { VacationGreeting } from './VacationGreeting';

const phoneFaxGreetingTypes = {
  awayGreeting: 1,
  voicemailGreeting: 2,
  sipGreeting: 3,
  vacationGreeting: 4,
  holdMusicGreeting: 5,
  customGreetings: 6,
};

configure({
  // computedRequiresReaction: true,
  // enforceActions: "observed",
  // reactionRequiresObservable: true,
  // observableRequiresReaction: true,
});

class RootStore {
  constructor() {
    this.routing = new RouterStore();
    this.notification = new Notification(this);
    this.authentication = new Authentication(this);
    this.users = new Users(this);
    this.dialer = new Dialer(this);
    this.tasks = new Task(this);
    this.rooms = new Room(this);
    this.utils = new Utils(this);
    this.lobby = new Lobby(this);
    this.officeChats = new OfficeChat(this);
    this.appointments = new Appointment(this);
    this.chats = new Chat(this);
    this.officeChats = new OfficeChat(this);
    this.activityLogs = new ActivityLog(this);
    this.patientChats = new PatientChat(this);
    this.patients = new Patient(this);
    this.patientsFeed = new PatientFeed(this);
    this.categories = new Category(this);
    this.phoneFaxOptions = new PhoneFaxOptions(this);
    this.formGroups = new FormGroups(this);
    this.notificationSetting = new NotificationSettings(this);
    this.patientForm = new PatientForm(this);
    this.patientData = new PatientData(this);
    this.holdMusicGreeting = new HoldMusicGreeting(
      this,
      phoneFaxGreetingTypes.holdMusicGreeting,
    );
    this.customGreetings = new CustomGreetings(
      this,
      phoneFaxGreetingTypes.customGreetings,
    );
    this.phoneFaxAwayGreeting = new PhoneFaxAwayGreeting(
      this,
      phoneFaxGreetingTypes.awayGreeting,
    );
    this.phoneFaxVoicemailGreeting = new PhoneFaxAwayGreeting(
      this,
      phoneFaxGreetingTypes.voicemailGreeting,
    );
    this.phoneFaxIVRVoicemailGreeting = new PhoneFaxAwayGreeting(
      this,
      phoneFaxGreetingTypes.sipGreeting,
    );
    this.phoneFaxVacationGreeting = new PhoneFaxAwayGreeting(
      this,
      phoneFaxGreetingTypes.vacationGreeting,
    );
    this.vacationGreeting = new VacationGreeting(
      this,
      phoneFaxGreetingTypes.vacationGreeting,
    );
    this.mobileNotificationSettings = new MobileNotificationSettings(this);
    this.paperlessForm = new PaperlessForm(this);
    this.hardwarePhone = new HardwarePhone(this);
    this.hardwarePhones = new HardwarePhones(this);
    this.phoneFaxSchedule = new PhoneFaxSchedule(this);
    this.patientFile = new PatientFile(this);
    this.fax = new Fax(this);
    this.practitioners = new Practitioners(this);
    this.formInitiation = new FormInitiation(this);
    this.trigger = new Trigger(this);
    this.incomingCall = new IncomingCall(this);
    this.incomingCalls = new IncomingCalls(this);
    this.callForwarding = new CallForwarding(this);
    this.officeProfile = new OfficeProfile(this);
    this.onlineSchedule = new OnlineSchedule(this);
    this.onlineScheduleSettings = new OnlineScheduleSettings(this);
    this.scheduling = new Scheduling(this);
    this.hygieneReminder = new HygieneReminder(this);
    this.appointmentReminder = new AppointmentReminder(this);
    this.analytics = new Analytics(this);
    this.contacts = new Contacts(this);
    this.ivrSettings = new IvrSettings(this);
    this.createIvr = new CreateIvr(this);
    this.purchaseNumbers = new PurchaseNumber(this);
    this.permissions = new Permissions(this);
    this.reminders = new Reminders(this);
    this.integrations = new Integrations(this);
    this.automationSettings = new AutomationSettings(this);
    this.paperlessAutomation = new PaperlessAutomation(this);
    this.localServerApp = new LocalServerApp(this);
    this.kittyOfficeChat = new KittyOfficeChat(this);
  }
}

export const store = new RootStore();

export const storesContext = React.createContext(store);
