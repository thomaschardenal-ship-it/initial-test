import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Settings as SettingsIcon, Save, Send, User, Mail, Phone } from 'lucide-react';
import { getSettings, updateSettings } from '../services/database';
import { Settings as SettingsType } from '../types';
import { sendSMS, sendEmail } from '../services/messageService';

export function Settings() {
  const dbSettings = useLiveQuery(() => getSettings());

  const [formData, setFormData] = useState<Omit<SettingsType, 'id'>>({
    userName: '',
    recipientPhone: '',
    recipientEmail: '',
    sendMethod: 'sms'
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (dbSettings) {
      setFormData({
        userName: dbSettings.userName,
        recipientPhone: dbSettings.recipientPhone,
        recipientEmail: dbSettings.recipientEmail,
        sendMethod: dbSettings.sendMethod
      });
    }
  }, [dbSettings]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    const testMessage = `${formData.userName || 'Test'} - Ceci est un message de test

Durée : 4h 30min
Arrivée : 08:30
Départ : 13:00

Pointeuse Digitale`;

    if (formData.sendMethod === 'sms') {
      if (!formData.recipientPhone) {
        alert('Veuillez configurer un numéro de téléphone');
        return;
      }
      sendSMS(formData.recipientPhone, testMessage);
    } else {
      if (!formData.recipientEmail) {
        alert('Veuillez configurer une adresse email');
        return;
      }
      sendEmail(formData.recipientEmail, 'Test - Pointeuse Digitale', testMessage);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-24 pt-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="text-primary w-8 h-8" />
          <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        </div>

        {/* User Info Card */}
        <div className="bg-navy/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-lg">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-primary" />
            Informations personnelles
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Votre nom
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              placeholder="Ex: Jean Dupont"
              className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Message Settings Card */}
        <div className="bg-navy/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-lg">
          <h2 className="text-base font-semibold text-white mb-4">
            Configuration des messages
          </h2>

          <div className="space-y-5">
            {/* Send Method Toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Méthode d'envoi
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChange('sendMethod', 'sms')}
                  className={`py-3 px-4 rounded-xl font-medium transition-all ${
                    formData.sendMethod === 'sms'
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  SMS
                </button>
                <button
                  onClick={() => handleChange('sendMethod', 'email')}
                  className={`py-3 px-4 rounded-xl font-medium transition-all ${
                    formData.sendMethod === 'email'
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  Email
                </button>
              </div>
            </div>

            {/* Phone Number */}
            {formData.sendMethod === 'sms' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-primary" />
                  Numéro destinataire
                </label>
                <input
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={(e) => handleChange('recipientPhone', e.target.value)}
                  placeholder="Ex: +33612345678"
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Format international recommandé (ex: +33...)
                </p>
              </div>
            )}

            {/* Email */}
            {formData.sendMethod === 'email' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-primary" />
                  Email destinataire
                </label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => handleChange('recipientEmail', e.target.value)}
                  placeholder="Ex: contact@example.com"
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-primary text-white hover:bg-primary/90 shadow-primary/30'
            }`}
          >
            <Save size={20} />
            {saved ? 'Sauvegardé !' : 'Sauvegarder'}
          </button>

          <button
            onClick={handleTest}
            className="px-6 py-4 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/30"
          >
            <Send size={20} />
            Test
          </button>
        </div>

        {/* Info */}
        <div className="bg-navy/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <p className="text-sm text-slate-400 leading-relaxed">
            💡 Les messages seront envoyés automatiquement lorsque vous pointez votre sortie.
            Utilisez le bouton "Test" pour vérifier la configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
