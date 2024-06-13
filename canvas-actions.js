import { ContextMenu } from "@xeokit/xeokit-sdk"
export function applyCanvasActions(viewer, treeView) {
    const canvasContextMenu = new ContextMenu({
        enabled: true,
        context: {
            viewer: viewer
        },
        items: [
            [
                {
                    title: "Hide All",
                    getEnabled: function (context) {
                        return (context.viewer.scene.numVisibleObjects > 0)
                    },
                    doAction: function (context) {
                        context.viewer.scene.setObjectsVisible(context.viewer.scene.visibleObjectIds, false)
                    }
                },
                {
                    title: "Show All",
                    getEnabled: function (context) {
                        const scene = context.viewer.scene
                        return (scene.numVisibleObjects < scene.numObjects)
                    },
                    doAction: function (context) {
                        const scene = context.viewer.scene
                        scene.setObjectsVisible(scene.objectIds, true)
                        scene.setObjectsXRayed(scene.xrayedObjectIds, false)
                        scene.setObjectsSelected(scene.selectedObjectIds, false)
                    }
                }
            ],
            [
                {
                    title: "View Fit All",
                    doAction: function (context) {
                        context.viewer.cameraFlight.flyTo({
                            aabb: context.viewer.scene.getAABB()
                        })
                    }
                }
            ]
        ]
    })

    const objectContextMenu = new ContextMenu({
        items: [
            [
                {
                    title: "View Fit",
                    doAction: function (context) {
                        const viewer = context.viewer
                        const scene = viewer.scene
                        const entity = context.entity
                        viewer.cameraFlight.flyTo({
                            aabb: entity.aabb,
                            duration: 0.5
                        }, () => {
                            setTimeout(function () {
                                scene.setObjectsHighlighted(scene.highlightedObjectIds, false)
                            }, 500)
                        })
                    }
                },
                {
                    title: "View Fit All",
                    doAction: function (context) {
                        const scene = context.viewer.scene
                        context.viewer.cameraFlight.flyTo({
                            projection: "perspective",
                            aabb: scene.getAABB(),
                            duration: 0.5
                        })
                    }
                },
                {
                    title: "Show in Tree",
                    doAction: function (context) {
                        const objectId = context.entity.id
                        context.treeViewPlugin.showNode(objectId)
                    }
                }
            ],
            [
                {
                    title: "Hide",
                    getEnabled: function (context) {
                        return context.entity.visible
                    },
                    doAction: function (context) {
                        context.entity.visible = false
                    }
                },
                {
                    title: "Hide Others",
                    doAction: function (context) {
                        const viewer = context.viewer
                        const scene = viewer.scene
                        const entity = context.entity
                        const metaObject = viewer.metaScene.metaObjects[entity.id]
                        if (!metaObject) {
                            return
                        }
                        scene.setObjectsVisible(scene.visibleObjectIds, false)
                        scene.setObjectsXRayed(scene.xrayedObjectIds, false)
                        scene.setObjectsSelected(scene.selectedObjectIds, false)
                        scene.setObjectsHighlighted(scene.highlightedObjectIds, false)
                        metaObject.withMetaObjectsInSubtree((metaObject) => {
                            const entity = scene.objects[metaObject.id]
                            if (entity) {
                                entity.visible = true
                            }
                        })
                    }
                },
                {
                    title: "Hide All",
                    getEnabled: function (context) {
                        return (context.viewer.scene.numVisibleObjects > 0)
                    },
                    doAction: function (context) {
                        context.viewer.scene.setObjectsVisible(context.viewer.scene.visibleObjectIds, false)
                    }
                },
                {
                    title: "Show All",
                    getEnabled: function (context) {
                        const scene = context.viewer.scene
                        return (scene.numVisibleObjects < scene.numObjects)
                    },
                    doAction: function (context) {
                        const scene = context.viewer.scene
                        scene.setObjectsVisible(scene.objectIds, true)
                    }
                }
            ],
            [
                {
                    title: "X-Ray",
                    getEnabled: function (context) {
                        return (!context.entity.xrayed)
                    },
                    doAction: function (context) {
                        context.entity.xrayed = true
                    }
                },
                {
                    title: "Undo X-Ray",
                    getEnabled: function (context) {
                        return context.entity.xrayed
                    },
                    doAction: function (context) {
                        context.entity.xrayed = false
                    }
                },
                {
                    title: "X-Ray Others",
                    doAction: function (context) {
                        const viewer = context.viewer
                        const scene = viewer.scene
                        const entity = context.entity
                        const metaObject = viewer.metaScene.metaObjects[entity.id]
                        if (!metaObject) {
                            return
                        }
                        scene.setObjectsVisible(scene.objectIds, true)
                        scene.setObjectsXRayed(scene.objectIds, true)
                        scene.setObjectsSelected(scene.selectedObjectIds, false)
                        scene.setObjectsHighlighted(scene.highlightedObjectIds, false)
                        metaObject.withMetaObjectsInSubtree((metaObject) => {
                            const entity = scene.objects[metaObject.id]
                            if (entity) {
                                entity.xrayed = false
                            }
                        })
                    }
                },
                {
                    title: "Reset X-Ray",
                    getEnabled: function (context) {
                        return (context.viewer.scene.numXRayedObjects > 0)
                    },
                    doAction: function (context) {
                        context.viewer.scene.setObjectsXRayed(context.viewer.scene.xrayedObjectIds, false)
                    }
                }
            ],
            [
                {
                    title: "Select",
                    getEnabled: function (context) {
                        return (!context.entity.selected)
                    },
                    doAction: function (context) {
                        context.entity.selected = true
                    }
                },
                {
                    title: "Undo select",
                    getEnabled: function (context) {
                        return context.entity.selected
                    },
                    doAction: function (context) {
                        context.entity.selected = false
                    }
                },
                {
                    title: "Clear Selection",
                    getEnabled: function (context) {
                        return (context.viewer.scene.numSelectedObjects > 0)
                    },
                    doAction: function (context) {
                        context.viewer.scene.setObjectsSelected(context.viewer.scene.selectedObjectIds, false)
                    }
                }
            ]
        ],
        enabled: true
    })
    viewer.cameraControl.on("rightClick", function (e) {
        var hit = viewer.scene.pick({
            canvasPos: e.canvasPos
        })
        if (hit && hit.entity.isObject) {
            objectContextMenu.context = { // Must set context before showing menu
                viewer: viewer,
                treeViewPlugin: treeView,
                entity: hit.entity
            }
            objectContextMenu.show(e.pagePos[0], e.pagePos[1])
        } else {
            canvasContextMenu.context = { // Must set context before showing menu
                viewer: viewer
            }
            canvasContextMenu.show(e.pagePos[0], e.pagePos[1])
        }
        e.event.preventDefault()
    })
    let downX = 0
    let downY = 0
    let tempSelection = ""
    document.querySelector("#xeokit_canvas").addEventListener("mousedown", (e) => {
        downX = e.offsetX
        downY = e.offsetY
    })

    document.querySelector("#xeokit_canvas").addEventListener("mouseup", (e) => {
        if (e.offsetX != downX || e.offsetY != downY) return

        const pick = viewer.scene.pick({ canvasPos: [e.offsetX, e.offsetY], pickSurfacePrecision: true })
        if (!pick || !pick.entity) return
        tempSelection = ""
        switch (e.button) {
            case 0: // left
                if (e.shiftKey) {
                    viewer.scene.setObjectsSelected([pick.entity.id], !pick.entity.selected)
                } else if (viewer.scene.selectedObjectIds.length == 0) {
                    viewer.scene.setObjectsSelected([pick.entity.id], !pick.entity.selected)
                } else {
                    viewer.scene.setObjectsSelected(viewer.scene.selectedObjectIds, false)
                    viewer.scene.setObjectsSelected([pick.entity.id], true)
                }
                break
            case 1: // center
                viewer.cameraFlight.flyTo({
                    aabb: pick.entity.aabb,
                    duration: 0.5
                })
                break
        }
    })
    document.querySelector("#xeokit_canvas").addEventListener("mousemove", (e) => {
        viewer.scene.setObjectsSelected([tempSelection], false)
        if (e.buttons != 0) return // buttons - not button. 0 for no button pressed
        const pick = viewer.scene.pick({ canvasPos: [e.offsetX, e.offsetY], pickSurfacePrecision: true })
        if (!pick || !pick.entity) return
        tempSelection = pick.entity.id
        viewer.scene.setObjectsSelected([tempSelection], true)
    })
}