import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Settings as SettingsIcon, Save, Send } from 'lucide-react';
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
    <div className="flex-1 overflow-y-auto p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <SettingsIcon className="text-primary" />
          Réglages
        </h1>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Informations personnelles</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Votre nom
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => handleChange('userName', e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Message Settings */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Configuration des messages</h2>

            <div className="space-y-4">
              {/* Send Method Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Méthode d'envoi
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleChange('sendMethod', 'sms')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.sendMethod === 'sms'
                        ? 'bg-primary text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    SMS
                  </button>
                  <button
                    onClick={() => handleChange('sendMethod', 'email')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.sendMethod === 'email'
                        ? 'bg-primary text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              {formData.sendMethod === 'sms' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Numéro destinataire
                  </label>
                  <input
                    type="tel"
                    value={formData.recipientPhone}
                    onChange={(e) => handleChange('recipientPhone', e.target.value)}
                    placeholder="Ex: +33612345678"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Format international recommandé (ex: +33...)
                  </p>
                </div>
              )}

              {/* Email */}
              {formData.sendMethod === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email destinataire
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => handleChange('recipientEmail', e.target.value)}
                    placeholder="Ex: contact@example.com"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary text-white hover:bg-emerald-600'
              }`}
            >
              <Save size={20} />
              {saved ? 'Sauvegardé !' : 'Sauvegarder'}
            </button>

            <button
              onClick={handleTest}
              className="px-6 py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Test
            </button>
          </div>

          {/* Info */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-sm text-slate-400 leading-relaxed">
              Les messages seront envoyés automatiquement lorsque vous pointez votre sortie.
              Utilisez le bouton "Test" pour vérifier la configuration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
