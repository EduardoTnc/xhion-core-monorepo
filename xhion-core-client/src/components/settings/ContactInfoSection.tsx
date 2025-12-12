"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Phone,
    Mail,
    Plus,
    Trash2,
    Linkedin,
    Globe,
    BookOpen,
    ExternalLink,
    Lock,
    Unlock,
    Info,
    Loader2,
    Save,
    Check,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    settingsService,
    type ContactInfo,
    type EnlaceProfesional,
    type TipoContacto,
    type TipoEnlaceProfesional,
} from '@/services/settingsService';

// ========== COUNTRY DATA ==========

interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

const COUNTRIES: Country[] = [
    { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪' },
    { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
    { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
    { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
    { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨' },
    { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
    { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴' },
    { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾' },
    { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾' },
    { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' },
    { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
    { code: 'CA', name: 'Canadá', dialCode: '+1', flag: '🇨🇦' },
    { code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸' },
    { code: 'GB', name: 'Reino Unido', dialCode: '+44', flag: '🇬🇧' },
    { code: 'DE', name: 'Alemania', dialCode: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'Francia', dialCode: '+33', flag: '🇫🇷' },
    { code: 'IT', name: 'Italia', dialCode: '+39', flag: '🇮🇹' },
    { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
    { code: 'JP', name: 'Japón', dialCode: '+81', flag: '🇯🇵' },
    { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
];

const CONTACT_TYPE_LABELS: Record<TipoContacto, string> = {
    telefono_principal: 'Teléfono Principal',
    telefono_secundario: 'Teléfono Secundario',
    email_personal: 'Email Personal',
};

const LINK_TYPE_LABELS: Record<TipoEnlaceProfesional, string> = {
    linkedin: 'LinkedIn',
    portafolio_personal: 'Portfolio Personal',
    blog_tecnico: 'Blog Técnico',
};

const LINK_TYPE_ICONS: Record<TipoEnlaceProfesional, React.ElementType> = {
    linkedin: Linkedin,
    portafolio_personal: Globe,
    blog_tecnico: BookOpen,
};

const LINK_TYPE_PLACEHOLDERS: Record<TipoEnlaceProfesional, string> = {
    linkedin: 'https://linkedin.com/in/tu-perfil',
    portafolio_personal: 'https://mi-portfolio.com',
    blog_tecnico: 'https://mi-blog.dev',
};

// ========== HELPER FUNCTIONS ==========

function extractCountryAndNumber(fullPhone: string): { countryCode: string; number: string } {
    const defaultCountry = COUNTRIES[0]; // Peru
    if (!fullPhone) return { countryCode: defaultCountry.code, number: '' };

    // Find matching country by dial code
    for (const country of COUNTRIES) {
        if (fullPhone.startsWith(country.dialCode)) {
            const number = fullPhone.slice(country.dialCode.length).replace(/\s/g, '');
            return { countryCode: country.code, number };
        }
    }

    // No match found, assume it's just a number
    return { countryCode: defaultCountry.code, number: fullPhone.replace(/[^\d]/g, '') };
}

function formatPhoneWithCountry(countryCode: string, number: string): string {
    const country = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];
    const cleanNumber = number.replace(/[^\d]/g, '');
    return `${country.dialCode} ${cleanNumber}`;
}

// ========== COMPONENT PROPS ==========

interface ContactInfoSectionProps {
    className?: string;
}

// ========== MAIN COMPONENT ==========

export function ContactInfoSection({ className }: ContactInfoSectionProps) {
    const [contacts, setContacts] = useState<ContactInfo[]>([]);
    const [enlaces, setEnlaces] = useState<EnlaceProfesional[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    // New contact form state
    const [newContact, setNewContact] = useState<{
        tipo: TipoContacto;
        countryCode: string;
        number: string;
        email: string;
        esPrivado: boolean;
    } | null>(null);

    // New link form state
    const [newLink, setNewLink] = useState<{
        tipo: TipoEnlaceProfesional;
        url: string;
    } | null>(null);

    // Delete confirmation
    const [deleteItem, setDeleteItem] = useState<{ type: 'contact' | 'link'; id: string; label: string } | null>(null);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [contactsData, enlacesData] = await Promise.all([
                settingsService.getContactos(),
                settingsService.getEnlacesProfesionales(),
            ]);
            setContacts(contactsData);
            setEnlaces(enlacesData);
        } catch (error) {
            console.error('Error loading contact data:', error);
            toast.error('Error al cargar información de contacto');
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== CONTACT HANDLERS ==========

    const getAvailableContactTypes = (): TipoContacto[] => {
        const usedTypes = contacts.map(c => c.tipo);
        return (['telefono_principal', 'telefono_secundario', 'email_personal'] as TipoContacto[])
            .filter(t => !usedTypes.includes(t));
    };

    const startAddContact = () => {
        const available = getAvailableContactTypes();
        if (available.length === 0) {
            toast.info('Ya has agregado todos los tipos de contacto disponibles');
            return;
        }
        setNewContact({
            tipo: available[0],
            countryCode: 'PE',
            number: '',
            email: '',
            esPrivado: true,
        });
    };

    const saveNewContact = async () => {
        if (!newContact) return;

        let valor: string;
        if (newContact.tipo === 'email_personal') {
            if (!newContact.email || !newContact.email.includes('@')) {
                toast.error('Ingresa un email válido');
                return;
            }
            valor = newContact.email;
        } else {
            if (!newContact.number || newContact.number.length < 6) {
                toast.error('Ingresa un número de teléfono válido');
                return;
            }
            valor = formatPhoneWithCountry(newContact.countryCode, newContact.number);
        }

        setSaving('new-contact');
        try {
            const created = await settingsService.addContacto({
                tipo: newContact.tipo,
                valor,
                esPrivado: newContact.esPrivado,
            });
            setContacts(prev => [...prev, created]);
            setNewContact(null);
            toast.success('Contacto agregado');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al guardar contacto');
        } finally {
            setSaving(null);
        }
    };

    const toggleContactPrivacy = async (contact: ContactInfo) => {
        setSaving(contact.id);
        try {
            const updated = await settingsService.updateContacto(contact.id, {
                esPrivado: !contact.esPrivado,
            });
            setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
            toast.success(updated.esPrivado ? 'Marcado como privado' : 'Marcado como visible');
        } catch (error) {
            toast.error('Error al cambiar privacidad');
        } finally {
            setSaving(null);
        }
    };

    const deleteContact = async () => {
        if (!deleteItem || deleteItem.type !== 'contact') return;
        try {
            await settingsService.deleteContacto(deleteItem.id);
            setContacts(prev => prev.filter(c => c.id !== deleteItem.id));
            toast.success('Contacto eliminado');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al eliminar contacto');
        } finally {
            setDeleteItem(null);
        }
    };

    // ========== LINK HANDLERS ==========

    const getAvailableLinkTypes = (): TipoEnlaceProfesional[] => {
        const usedTypes = enlaces.map(e => e.tipo);
        return (['linkedin', 'portafolio_personal', 'blog_tecnico'] as TipoEnlaceProfesional[])
            .filter(t => !usedTypes.includes(t));
    };

    const startAddLink = () => {
        const available = getAvailableLinkTypes();
        if (available.length === 0) {
            toast.info('Ya has agregado todos los tipos de enlace disponibles');
            return;
        }
        setNewLink({
            tipo: available[0],
            url: '',
        });
    };

    const saveNewLink = async () => {
        if (!newLink) return;

        if (!newLink.url.startsWith('http://') && !newLink.url.startsWith('https://')) {
            toast.error('La URL debe comenzar con http:// o https://');
            return;
        }

        setSaving('new-link');
        try {
            const created = await settingsService.addEnlaceProfesional(newLink);
            setEnlaces(prev => [...prev, created]);
            setNewLink(null);
            toast.success('Enlace agregado');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al guardar enlace');
        } finally {
            setSaving(null);
        }
    };

    const deleteLink = async () => {
        if (!deleteItem || deleteItem.type !== 'link') return;
        try {
            await settingsService.deleteEnlaceProfesional(deleteItem.id);
            setEnlaces(prev => prev.filter(e => e.id !== deleteItem.id));
            toast.success('Enlace eliminado');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al eliminar enlace');
        } finally {
            setDeleteItem(null);
        }
    };

    // ========== RENDER ==========

    if (loading) {
        return (
            <div className={cn("flex items-center justify-center py-12", className)}>
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const availableContactTypes = getAvailableContactTypes();
    const availableLinkTypes = getAvailableLinkTypes();

    return (
        <div className={cn("space-y-6", className)}>
            {/* Privacy persuasion notice */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                    <p className="font-medium text-foreground">¿Por qué compartir tu información?</p>
                    <p className="text-muted-foreground mt-0.5">
                        Tu información de contacto nos ayuda a comunicarnos contigo en situaciones laborales importantes.
                        Solo será visible para RRHH y tu supervisor directo.
                    </p>
                </div>
            </div>

            {/* ========== CONTACTS SECTION ========== */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">Teléfonos y Email Personal</h4>
                    </div>
                    {availableContactTypes.length > 0 && !newContact && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={startAddContact}>
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Agregar
                        </Button>
                    )}
                </div>

                <div className="space-y-2">
                    {/* Existing contacts */}
                    {contacts.map(contact => {
                        const isPhone = contact.tipo.startsWith('telefono');
                        const { countryCode, number } = isPhone ? extractCountryAndNumber(contact.valor) : { countryCode: '', number: '' };
                        const country = COUNTRIES.find(c => c.code === countryCode);

                        return (
                            <div
                                key={contact.id}
                                className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30"
                            >
                                {/* Type badge */}
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                                    {CONTACT_TYPE_LABELS[contact.tipo]}
                                </Badge>

                                {/* Value display */}
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                    {isPhone && country && (
                                        <span className="text-base">{country.flag}</span>
                                    )}
                                    <span className="text-sm font-medium truncate">
                                        {isPhone ? `${country?.dialCode || ''} ${number}` : contact.valor}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => toggleContactPrivacy(contact)}
                                        disabled={saving === contact.id}
                                        title={contact.esPrivado ? 'Privado' : 'Visible'}
                                    >
                                        {saving === contact.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : contact.esPrivado ? (
                                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                                        ) : (
                                            <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => setDeleteItem({ type: 'contact', id: contact.id, label: CONTACT_TYPE_LABELS[contact.tipo] })}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    {/* New contact form (inline) */}
                    {newContact && (
                        <div className="flex flex-col gap-2 p-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
                            <div className="flex items-center gap-2">
                                <Select
                                    value={newContact.tipo}
                                    onValueChange={(v) => setNewContact(prev => prev ? { ...prev, tipo: v as TipoContacto } : null)}
                                >
                                    <SelectTrigger className="w-[180px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableContactTypes.map(tipo => (
                                            <SelectItem key={tipo} value={tipo} className="text-xs">
                                                {CONTACT_TYPE_LABELS[tipo]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex-1" />
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Lock className="w-3 h-3" />
                                    <span>Privado</span>
                                    <Switch
                                        checked={newContact.esPrivado}
                                        onCheckedChange={(v) => setNewContact(prev => prev ? { ...prev, esPrivado: v } : null)}
                                        className="ml-1 scale-75"
                                    />
                                </div>
                            </div>

                            {newContact.tipo === 'email_personal' ? (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <Input
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact(prev => prev ? { ...prev, email: e.target.value } : null)}
                                        className="h-8 text-sm flex-1"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {/* Country selector */}
                                    <Select
                                        value={newContact.countryCode}
                                        onValueChange={(v) => setNewContact(prev => prev ? { ...prev, countryCode: v } : null)}
                                    >
                                        <SelectTrigger className="w-[100px] h-8 text-xs">
                                            <SelectValue>
                                                {(() => {
                                                    const c = COUNTRIES.find(c => c.code === newContact.countryCode);
                                                    return c ? `${c.flag} ${c.dialCode}` : '+51';
                                                })()}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {COUNTRIES.map(c => (
                                                <SelectItem key={c.code} value={c.code} className="text-xs">
                                                    <span className="flex items-center gap-2">
                                                        <span>{c.flag}</span>
                                                        <span>{c.dialCode}</span>
                                                        <span className="text-muted-foreground">{c.name}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* Phone number input */}
                                    <Input
                                        type="tel"
                                        placeholder="999 888 777"
                                        value={newContact.number}
                                        onChange={(e) => setNewContact(prev => prev ? { ...prev, number: e.target.value.replace(/[^\d\s]/g, '') } : null)}
                                        className="h-8 text-sm flex-1"
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 mt-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setNewContact(null)}
                                >
                                    <X className="w-3.5 h-3.5 mr-1" />
                                    Cancelar
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={saveNewContact}
                                    disabled={saving === 'new-contact'}
                                >
                                    {saving === 'new-contact' ? (
                                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                    ) : (
                                        <Check className="w-3.5 h-3.5 mr-1" />
                                    )}
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {contacts.length === 0 && !newContact && (
                        <div className="py-6 text-center border border-dashed rounded-lg">
                            <Phone className="w-6 h-6 mx-auto text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground">Sin información de contacto</p>
                            <Button variant="link" size="sm" className="mt-1 h-auto text-xs" onClick={startAddContact}>
                                Agregar tu primer contacto
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* ========== PROFESSIONAL LINKS SECTION ========== */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">Enlaces Profesionales</h4>
                    </div>
                    {availableLinkTypes.length > 0 && !newLink && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={startAddLink}>
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Agregar
                        </Button>
                    )}
                </div>

                <div className="space-y-2">
                    {/* Existing links */}
                    {enlaces.map(link => {
                        const Icon = LINK_TYPE_ICONS[link.tipo];
                        return (
                            <div
                                key={link.id}
                                className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30"
                            >
                                <Icon className="w-4 h-4 text-blue-500 shrink-0" />
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                                    {LINK_TYPE_LABELS[link.tipo]}
                                </Badge>
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-sm text-primary hover:underline truncate"
                                >
                                    {link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                                </a>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => setDeleteItem({ type: 'link', id: link.id, label: LINK_TYPE_LABELS[link.tipo] })}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    {/* New link form (inline) */}
                    {newLink && (
                        <div className="flex flex-col gap-2 p-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
                            <div className="flex items-center gap-2">
                                <Select
                                    value={newLink.tipo}
                                    onValueChange={(v) => setNewLink(prev => prev ? { ...prev, tipo: v as TipoEnlaceProfesional } : null)}
                                >
                                    <SelectTrigger className="w-[180px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableLinkTypes.map(tipo => (
                                            <SelectItem key={tipo} value={tipo} className="text-xs">
                                                {LINK_TYPE_LABELS[tipo]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                {(() => {
                                    const Icon = LINK_TYPE_ICONS[newLink.tipo];
                                    return <Icon className="w-4 h-4 text-muted-foreground shrink-0" />;
                                })()}
                                <Input
                                    type="url"
                                    placeholder={LINK_TYPE_PLACEHOLDERS[newLink.tipo]}
                                    value={newLink.url}
                                    onChange={(e) => setNewLink(prev => prev ? { ...prev, url: e.target.value } : null)}
                                    className="h-8 text-sm flex-1"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setNewLink(null)}
                                >
                                    <X className="w-3.5 h-3.5 mr-1" />
                                    Cancelar
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={saveNewLink}
                                    disabled={saving === 'new-link'}
                                >
                                    {saving === 'new-link' ? (
                                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                    ) : (
                                        <Check className="w-3.5 h-3.5 mr-1" />
                                    )}
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {enlaces.length === 0 && !newLink && (
                        <div className="py-6 text-center border border-dashed rounded-lg">
                            <Linkedin className="w-6 h-6 mx-auto text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground">Sin enlaces profesionales</p>
                            <Button variant="link" size="sm" className="mt-1 h-auto text-xs" onClick={startAddLink}>
                                Agregar tu primer enlace
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* ========== DELETE CONFIRMATION ========== */}
            <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar {deleteItem?.label}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente este {deleteItem?.type === 'contact' ? 'contacto' : 'enlace'} de tu perfil.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteItem?.type === 'contact' ? deleteContact : deleteLink}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
