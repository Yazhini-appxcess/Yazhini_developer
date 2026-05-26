"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import {
    Plus,
    Globe,
    Zap,
    Trash2,
    Link2,
    Settings2,
    CheckCircle2,
    X,
    Activity,
    Router,
    Wifi,
    Cpu,
    Server,
    Hash,
    Fingerprint,
    Lock,
    Thermometer,
    Gauge,
    Battery,
    Signal
} from "lucide-react";

interface IotDevice {
    id: number;
    name: string;
    type: string;
    protocol: string;
    status: string;
    lastActive: string;
    deviceId: string;
}

export default function IotHubPage() {
    const router = useRouter();
    const [devices, setDevices] = useState<IotDevice[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [newDevice, setNewDevice] = useState({
        name: "",
        type: "Sensor",
        protocol: "MQTT",
        topic: "iot/sensors/warehouse/temp",
        mqttBroker: "your-server-ip",
        mqttPort: "1883",
        deviceId: "generated_device_id",
        deviceSecret: "generated_secret"
    });

    useEffect(() => {
        const userStr = localStorage.getItem("admin_user");
        if (!userStr) {
            router.push("/login");
            return;
        }
    }, [router]);

    const handleAddDevice = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            const entry: IotDevice = {
                id: Date.now(),
                name: newDevice.name,
                type: newDevice.type,
                protocol: newDevice.protocol,
                status: "active",
                lastActive: "Just now",
                deviceId: Math.random().toString(36).substring(2, 11).toUpperCase()
            };
            setDevices([...devices, entry]);
            setIsSaving(false);
            setShowModal(false);
            setNewDevice({
                name: "",
                type: "Sensor",
                protocol: "MQTT",
                topic: "iot/sensors/warehouse/temp",
                mqttBroker: "your-server-ip",
                mqttPort: "1883",
                deviceId: "generated_device_id",
                deviceSecret: "generated_secret"
            });
        }, 1200);
    };




    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden text-slate-900">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center space-x-5">
                                <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-sm transition-transform hover:scale-105 duration-300">
                                    <Router className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">IoT Hub</h2>
                                    <p className="text-slate-500">Manage connected devices, sensors, and real-time data streams.</p>
                                </div>
                            </div>
                        </div>

                        {/* Device Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {devices.length > 0 ? (
                                devices.map((item) => (
                                    <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-indigo-50 transition-colors">
                                                <Settings2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDevices(devices.filter(i => i.id !== item.id))}
                                                className="p-2 text-slate-400 hover:text-red-600 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                                {item.type === "Sensor" ? <Thermometer className="w-6 h-6" /> :
                                                    item.type === "Gateway" ? <Router className="w-6 h-6" /> :
                                                        item.type === "Controller" ? <Cpu className="w-6 h-6" /> :
                                                            <Wifi className="w-6 h-6" />}
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                                Online
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h3>
                                            <div className="flex items-center text-xs text-slate-500 font-mono">
                                                <Hash className="w-3 h-3 mr-1" />
                                                ID: {item.deviceId}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                                                <p className="text-sm font-semibold text-slate-700">{item.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Protocol</p>
                                                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                                    {item.protocol}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                                            <div className="flex items-center">
                                                <Activity className="w-3.5 h-3.5 mr-1.5" />
                                                Last Active: {item.lastActive}
                                            </div>
                                            <div className="flex items-center text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Live Data <Zap className="w-3 h-3 ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-indigo-500/5 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                        <Router className="w-64 h-64 transform rotate-12" />
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                                        {/* Form Section */}
                                        <div className="flex-1 max-w-xl">
                                            <div className="mb-8">
                                                <h4 className="text-3xl font-extrabold text-slate-900 mb-2">Connect New Device</h4>
                                                <p className="text-slate-500 text-lg">
                                                    Register your hardware to start data processing.
                                                </p>
                                            </div>

                                            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 backdrop-blur-sm">
                                                <DeviceForm newDevice={newDevice} setNewDevice={setNewDevice} handleAddDevice={handleAddDevice} isSaving={isSaving} />
                                            </div>
                                        </div>

                                        {/* Description Section */}
                                        <div className="lg:w-80 space-y-8">
                                            <div className="space-y-6">
                                                <h5 className="font-bold text-slate-900 uppercase tracking-[0.2em] text-[10px] flex items-center">
                                                    <span className="w-6 h-px bg-indigo-200 mr-3"></span>
                                                    Connection Guide
                                                </h5>

                                                <div className="space-y-6">
                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex-shrink-0 flex items-center justify-center border border-indigo-100">
                                                            <Zap className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <h6 className="font-bold text-sm text-slate-900 mb-1">MQTT Protocol</h6>
                                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                                Lightweight messaging for low-bandwidth sensors. Requires Broker IP and Port (default 1883).
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex-shrink-0 flex items-center justify-center border border-amber-100">
                                                            <Lock className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <h6 className="font-bold text-sm text-slate-900 mb-1">Security First</h6>
                                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                                Device ID and Secret are used for AES-256 encryption on all outgoing streams.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex-shrink-0 flex items-center justify-center border border-emerald-100">
                                                            <Wifi className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <h6 className="font-bold text-sm text-slate-900 mb-1">Topic Structure</h6>
                                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                                Organize devices via paths. Example: <code className="bg-slate-100 px-1 rounded text-indigo-600">office/sensor/temp</code>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex-shrink-0 flex items-center justify-center border border-blue-100">
                                                            <Globe className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h6 className="font-bold text-sm text-slate-900 mb-1">API Webhooks</h6>
                                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                                Enable push notifications to external CRM/ERP systems when threshold events are triggered.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex-shrink-0 flex items-center justify-center border border-rose-100">
                                                            <Cpu className="w-5 h-5 text-rose-600" />
                                                        </div>
                                                        <div>
                                                            <h6 className="font-bold text-sm text-slate-900 mb-1">Edge Computing</h6>
                                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                                Run localized AI models directly on the gateway for sub-millisecond latency in mission-critical environments.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Activity className="w-4 h-4" />
                                                    <span className="font-bold text-xs uppercase tracking-wider">Live Status</span>
                                                </div>
                                                <p className="text-[11px] leading-relaxed opacity-90">
                                                    Devices show <span className="font-bold text-emerald-300">Online</span> immediately after successful handshake and heartbeat pulse.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Device Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-800">
                        <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800">Add New Device</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Configure your IoT peripheral connection.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-all bg-white border border-slate-100 shadow-sm">
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                            <DeviceForm newDevice={newDevice} setNewDevice={setNewDevice} handleAddDevice={handleAddDevice} isSaving={isSaving} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface DeviceFormProps {
    newDevice: {
        name: string;
        type: string;
        protocol: string;
        topic: string;
        mqttBroker: string;
        mqttPort: string;
        deviceId: string;
        deviceSecret: string;
    };
    setNewDevice: React.Dispatch<React.SetStateAction<{
        name: string;
        type: string;
        protocol: string;
        topic: string;
        mqttBroker: string;
        mqttPort: string;
        deviceId: string;
        deviceSecret: string;
    }>>;
    handleAddDevice: (e: React.FormEvent) => void;
    isSaving: boolean;
}

const DeviceForm = ({ newDevice, setNewDevice, handleAddDevice, isSaving }: DeviceFormProps) => (
    <form onSubmit={handleAddDevice} className="space-y-5 text-left">
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                    <Cpu className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                    Device Name
                </label>
                <input
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                    placeholder="e.g. Warehouse Temp Sensor 1"
                    value={newDevice.name}
                    onChange={e => setNewDevice({ ...newDevice, name: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Settings2 className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        Type
                    </label>
                    <select
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
                        value={newDevice.type}
                        onChange={e => setNewDevice({ ...newDevice, type: e.target.value })}
                    >
                        <option>Sensor</option>
                        <option>Actuator</option>
                        <option>Gateway</option>
                        <option>Camera</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Link2 className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        Protocol
                    </label>
                    <select
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
                        value={newDevice.protocol}
                        onChange={e => setNewDevice({ ...newDevice, protocol: e.target.value })}
                    >
                        <option>MQTT</option>
                        <option>HTTP/REST</option>
                        <option>CoAP</option>
                        <option>WebSocket</option>
                    </select>
                </div>
            </div>

            {/* MQTT Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Server className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        MQTT Broker
                    </label>
                    <input
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-xs"
                        placeholder="your-server-ip"
                        value={newDevice.mqttBroker}
                        onChange={e => setNewDevice({ ...newDevice, mqttBroker: e.target.value })}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Hash className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        Port
                    </label>
                    <input
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                        placeholder="1883"
                        value={newDevice.mqttPort}
                        onChange={e => setNewDevice({ ...newDevice, mqttPort: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                    <Globe className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                    Topic / Endpoint
                </label>
                <input
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                    placeholder="iot/sensors/warehouse/temp"
                    value={newDevice.topic}
                    onChange={e => setNewDevice({ ...newDevice, topic: e.target.value })}
                />
            </div>

            {/* Security Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Fingerprint className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        Device ID
                    </label>
                    <input
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-xs"
                        placeholder="generated_device_id"
                        value={newDevice.deviceId}
                        onChange={e => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        Secret
                    </label>
                    <input
                        required
                        type="password"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                        placeholder="generated_secret"
                        value={newDevice.deviceSecret}
                        onChange={e => setNewDevice({ ...newDevice, deviceSecret: e.target.value })}
                    />
                </div>
            </div>
        </div>
        <div className="pt-2">
            <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
                {isSaving ? "Registering Device..." : "Complete Registration"}
            </button>
        </div>
    </form>
);

