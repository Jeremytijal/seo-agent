import React, { useState } from 'react';
import { 
    Image, Sparkles, Download, Copy, Trash2, Plus,
    RefreshCw, Grid, List, Search, Filter, Check,
    Palette, Maximize2, X, ExternalLink
} from 'lucide-react';
import './ImagesAI.css';

const ImagesAI = () => {
    const [images, setImages] = useState([
        {
            id: 1,
            prompt: 'Modern office workspace with laptop and coffee, minimalist style',
            url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            style: 'realistic',
            size: '1024x1024',
            createdAt: '2024-12-10'
        },
        {
            id: 2,
            prompt: 'Digital marketing concept with graphs and analytics',
            url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            style: 'realistic',
            size: '1024x1024',
            createdAt: '2024-12-09'
        },
        {
            id: 3,
            prompt: 'SEO optimization illustration with search icons',
            url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800',
            style: 'illustration',
            size: '1024x1024',
            createdAt: '2024-12-08'
        },
        {
            id: 4,
            prompt: 'Team collaboration in modern startup environment',
            url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
            style: 'realistic',
            size: '1792x1024',
            createdAt: '2024-12-07'
        },
    ]);

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedImage, setSelectedImage] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const [newImage, setNewImage] = useState({
        prompt: '',
        style: 'realistic',
        size: '1024x1024'
    });

    const styles = [
        { value: 'realistic', label: 'Réaliste', desc: 'Photos naturelles' },
        { value: 'illustration', label: 'Illustration', desc: 'Dessins artistiques' },
        { value: 'minimalist', label: 'Minimaliste', desc: 'Design épuré' },
        { value: '3d', label: '3D Render', desc: 'Images 3D' }
    ];

    const sizes = [
        { value: '1024x1024', label: 'Carré (1:1)', desc: '1024×1024' },
        { value: '1792x1024', label: 'Paysage (16:9)', desc: '1792×1024' },
        { value: '1024x1792', label: 'Portrait (9:16)', desc: '1024×1792' }
    ];

    const handleGenerate = async () => {
        if (!newImage.prompt) return;

        setIsGenerating(true);

        // Simulation (à remplacer par l'appel API)
        setTimeout(() => {
            const generated = {
                id: Date.now(),
                prompt: newImage.prompt,
                url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
                style: newImage.style,
                size: newImage.size,
                createdAt: new Date().toISOString().split('T')[0]
            };

            setImages(prev => [generated, ...prev]);
            setShowGenerateModal(false);
            setIsGenerating(false);
            setNewImage({ prompt: '', style: 'realistic', size: '1024x1024' });
        }, 3000);
    };

    const deleteImage = (id) => {
        if (confirm('Supprimer cette image ?')) {
            setImages(prev => prev.filter(img => img.id !== id));
        }
    };

    const copyToClipboard = async (url, id) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="images-page">
            <header className="images-header">
                <div>
                    <h1>Images IA</h1>
                    <p>Générez des visuels uniques pour vos contenus SEO</p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button 
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </button>
                        <button 
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button className="btn-generate" onClick={() => setShowGenerateModal(true)}>
                        <Sparkles size={18} />
                        Générer une image
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="images-stats">
                <div className="stat-card">
                    <Image size={24} />
                    <div>
                        <span className="stat-value">{images.length}</span>
                        <span className="stat-label">Images générées</span>
                    </div>
                </div>
            </div>

            {/* Images Grid/List */}
            {images.length > 0 ? (
                <div className={`images-container ${viewMode}`}>
                    {images.map(image => (
                        <div key={image.id} className="image-card">
                            <div 
                                className="image-preview"
                                onClick={() => setSelectedImage(image)}
                            >
                                <img src={image.url} alt={image.prompt} />
                                <div className="image-overlay">
                                    <Maximize2 size={24} />
                                </div>
                            </div>
                            <div className="image-info">
                                <p className="image-prompt">{image.prompt}</p>
                                <div className="image-meta">
                                    <span className="meta-badge">{image.style}</span>
                                    <span className="meta-badge">{image.size}</span>
                                    <span className="meta-date">{image.createdAt}</span>
                                </div>
                                <div className="image-actions">
                                    <button 
                                        className="btn-action"
                                        onClick={() => copyToClipboard(image.url, image.id)}
                                        title="Copier l'URL"
                                    >
                                        {copiedId === image.id ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                    <a 
                                        href={image.url} 
                                        download 
                                        className="btn-action"
                                        title="Télécharger"
                                    >
                                        <Download size={16} />
                                    </a>
                                    <button 
                                        className="btn-action delete"
                                        onClick={() => deleteImage(image.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="images-empty">
                    <div className="empty-icon">
                        <Image size={48} />
                    </div>
                    <h3>Aucune image générée</h3>
                    <p>Créez des visuels uniques pour illustrer vos articles SEO</p>
                    <button className="btn-primary" onClick={() => setShowGenerateModal(true)}>
                        <Sparkles size={18} />
                        Générer ma première image
                    </button>
                </div>
            )}

            {/* Generate Modal */}
            {showGenerateModal && (
                <div className="modal-overlay" onClick={() => !isGenerating && setShowGenerateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <Sparkles size={24} />
                                Générer une image
                            </h2>
                            {!isGenerating && (
                                <button className="modal-close" onClick={() => setShowGenerateModal(false)}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {isGenerating ? (
                            <div className="generating-state">
                                <div className="generating-animation">
                                    <RefreshCw size={40} className="animate-spin" />
                                </div>
                                <h3>Génération en cours...</h3>
                                <p>Notre IA crée votre image unique</p>
                                <div className="generating-prompt">
                                    "{newImage.prompt}"
                                </div>
                            </div>
                        ) : (
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Description de l'image *</label>
                                    <textarea
                                        placeholder="Décrivez l'image que vous souhaitez générer en détail..."
                                        value={newImage.prompt}
                                        onChange={(e) => setNewImage(prev => ({ ...prev, prompt: e.target.value }))}
                                        rows={3}
                                    />
                                    <span className="form-hint">Soyez précis pour de meilleurs résultats</span>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Palette size={16} />
                                        Style
                                    </label>
                                    <div className="style-grid">
                                        {styles.map(style => (
                                            <label 
                                                key={style.value} 
                                                className={`style-option ${newImage.style === style.value ? 'active' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="style"
                                                    value={style.value}
                                                    checked={newImage.style === style.value}
                                                    onChange={(e) => setNewImage(prev => ({ ...prev, style: e.target.value }))}
                                                />
                                                <span className="style-label">{style.label}</span>
                                                <span className="style-desc">{style.desc}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Format</label>
                                    <div className="size-options">
                                        {sizes.map(size => (
                                            <label 
                                                key={size.value}
                                                className={`size-option ${newImage.size === size.value ? 'active' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="size"
                                                    value={size.value}
                                                    checked={newImage.size === size.value}
                                                    onChange={(e) => setNewImage(prev => ({ ...prev, size: e.target.value }))}
                                                />
                                                <div className={`size-preview ${size.value.replace('x', '-')}`}></div>
                                                <div className="size-info">
                                                    <span className="size-label">{size.label}</span>
                                                    <span className="size-desc">{size.desc}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isGenerating && (
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setShowGenerateModal(false)}>
                                    Annuler
                                </button>
                                <button 
                                    className="btn-primary"
                                    onClick={handleGenerate}
                                    disabled={!newImage.prompt}
                                >
                                    <Sparkles size={18} />
                                    Générer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {selectedImage && (
                <div className="lightbox" onClick={() => setSelectedImage(null)}>
                    <button className="lightbox-close">
                        <X size={24} />
                    </button>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage.url} alt={selectedImage.prompt} />
                        <div className="lightbox-info">
                            <p>{selectedImage.prompt}</p>
                            <div className="lightbox-actions">
                                <button onClick={() => copyToClipboard(selectedImage.url, selectedImage.id)}>
                                    <Copy size={16} />
                                    Copier l'URL
                                </button>
                                <a href={selectedImage.url} download>
                                    <Download size={16} />
                                    Télécharger
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagesAI;

