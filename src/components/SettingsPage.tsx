"use client";

import { useState } from "react";
import {
    Database,
    Key,
    Bell,
    Shield,
    Save,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
    const [mongoUri, setMongoUri] = useState("");
    const [geminiKey, setGeminiKey] = useState("");
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        proxyDetection: true,
        weeklyReport: false,
    });
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const handleSave = async () => {
        setSaveStatus("saving");

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">
                        Configure your application settings and integrations
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saveStatus === "saving"}
                    className="btn btn-primary"
                >
                    {saveStatus === "saving" ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : saveStatus === "saved" ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Database Settings */}
            <div className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Database className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">Database Connection</h2>
                        <p className="text-sm text-gray-500">Configure MongoDB connection</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            MongoDB URI
                        </label>
                        <input
                            type="text"
                            placeholder="mongodb://localhost:27017/proxy-attendance"
                            className="input"
                            value={mongoUri}
                            onChange={(e) => setMongoUri(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Your MongoDB connection string. For Atlas, use the full URI with credentials.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-700">Connected to database</span>
                    </div>
                </div>
            </div>

            {/* API Settings */}
            <div className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Key className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">Gemini API</h2>
                        <p className="text-sm text-gray-500">Configure AI analysis settings</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showGeminiKey ? "text" : "password"}
                                placeholder="Enter your Gemini API key"
                                className="input pr-10"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowGeminiKey(!showGeminiKey)}
                            >
                                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Get your API key from{" "}
                            <a
                                href="https://makersuite.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:underline"
                            >
                                Google AI Studio
                            </a>
                        </p>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <strong>Note:</strong> API keys are stored securely and never exposed to the client.
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Bell className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">Notifications</h2>
                        <p className="text-sm text-gray-500">Manage alert preferences</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { id: "emailAlerts", label: "Email Alerts", desc: "Receive email notifications for important events" },
                        { id: "proxyDetection", label: "Proxy Detection Alerts", desc: "Get notified when proxy attendance is detected" },
                        { id: "weeklyReport", label: "Weekly Report", desc: "Receive weekly summary of all sessions" },
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2">
                            <div>
                                <div className="font-medium text-gray-900">{item.label}</div>
                                <div className="text-sm text-gray-500">{item.desc}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notifications[item.id as keyof typeof notifications]}
                                    onChange={(e) =>
                                        setNotifications({ ...notifications, [item.id]: e.target.checked })
                                    }
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security */}
            <div className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">Security</h2>
                        <p className="text-sm text-gray-500">Manage security settings</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                            <div className="font-medium text-gray-900">Session Timeout</div>
                            <div className="text-sm text-gray-500">Automatically log out after inactivity</div>
                        </div>
                        <select className="input w-auto">
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                            <option value="never">Never</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <div className="font-medium text-gray-900">Data Retention</div>
                            <div className="text-sm text-gray-500">How long to keep attendance records</div>
                        </div>
                        <select className="input w-auto">
                            <option value="6">6 months</option>
                            <option value="12">1 year</option>
                            <option value="24">2 years</option>
                            <option value="forever">Forever</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
